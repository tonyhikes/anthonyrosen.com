const responseHeaders = {
	"Cache-Control": "no-store",
	"Content-Type": "application/json; charset=utf-8",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: responseHeaders,
	});
}

function cleanSingleLine(value: FormDataEntryValue | null, maxLength: number) {
	if (typeof value !== "string") return "";
	return value
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, maxLength);
}

function cleanMessage(value: FormDataEntryValue | null, maxLength: number) {
	if (typeof value !== "string") return "";
	return value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength);
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#039;",
		};
		return entities[character];
	});
}

export default {
	async fetch(request: Request) {
		if (request.method !== "POST") {
			return new Response(null, {
				status: 405,
				headers: { ...responseHeaders, Allow: "POST" },
			});
		}

		const requestUrl = new URL(request.url);
		const origin = request.headers.get("origin");
		if (origin && new URL(origin).host !== requestUrl.host) {
			return json({ ok: false, error: "Request origin not allowed." }, 403);
		}

		const contentLength = Number(request.headers.get("content-length") || 0);
		if (contentLength > 20_000) {
			return json({ ok: false, error: "Message is too large." }, 413);
		}

		let formData: FormData;
		try {
			formData = await request.formData();
		} catch {
			return json({ ok: false, error: "Invalid form submission." }, 400);
		}

		// Bots commonly fill fields that are intentionally hidden from people.
		if (cleanSingleLine(formData.get("_gotcha"), 200)) {
			return json({ ok: true });
		}

		const name = cleanSingleLine(formData.get("name"), 80);
		const email = cleanSingleLine(formData.get("email"), 120).toLowerCase();
		const message = cleanMessage(formData.get("message"), 2000);

		if (!name || !emailPattern.test(email) || message.length < 10) {
			return json(
				{ ok: false, error: "Please check your name, email, and message." },
				400
			);
		}

		const apiKey = process.env.RESEND_API_KEY?.trim();
		if (!apiKey) {
			console.error("Contact form is missing RESEND_API_KEY.");
			return json({ ok: false, error: "Contact form is not configured." }, 503);
		}

		const from =
			process.env.RESEND_FROM_EMAIL?.trim() ||
			"Anthony Rosen Website <onboarding@resend.dev>";
		const to = process.env.CONTACT_TO_EMAIL?.trim() || "anthonyrosen@gmail.com";
		const safeName = escapeHtml(name);
		const safeEmail = escapeHtml(email);
		const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

		const resendResponse = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
				"Idempotency-Key": crypto.randomUUID(),
				"User-Agent": "anthonyrosen.com-contact-form/1.0",
			},
			body: JSON.stringify({
				from,
				to: [to],
				reply_to: email,
				subject: `Website inquiry from ${name}`,
				text: `New website inquiry\n\nName: ${name}\nEmail: ${email}\n\n${message}`,
				html: `<h2>New website inquiry</h2><p><strong>Name:</strong> ${safeName}<br /><strong>Email:</strong> ${safeEmail}</p><p>${safeMessage}</p>`,
			}),
		});

		if (!resendResponse.ok) {
			console.error(
				`Resend rejected a contact message (${resendResponse.status}).`
			);
			return json({ ok: false, error: "Message delivery failed." }, 502);
		}

		return json({ ok: true });
	},
};

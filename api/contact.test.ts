import assert from "node:assert/strict";
import test from "node:test";

import contactHandler from "./contact.ts";

const endpoint = "https://www.anthonyrosen.com/api/contact";
const originalFetch = globalThis.fetch;
const originalApiKey = process.env.RESEND_API_KEY;

function makeRequest(
	fields: Record<string, string>,
	origin: string | null = "https://www.anthonyrosen.com"
) {
	const body = new FormData();
	Object.entries(fields).forEach(([name, value]) => body.set(name, value));
	const headers = new Headers();
	if (origin) headers.set("Origin", origin);

	return new Request(endpoint, { method: "POST", headers, body });
}

function normalFields(overrides: Record<string, string> = {}) {
	return {
		name: "A Real Person",
		email: "person@example.com",
		message: "I would like to discuss a project with you next week.",
		form_started_at: String(Date.now() - 5_000),
		...overrides,
	};
}

test("contact endpoint spam guards", async (t) => {
	t.after(() => {
		globalThis.fetch = originalFetch;
		if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
		else process.env.RESEND_API_KEY = originalApiKey;
	});

	await t.test("requires a same-origin browser request", async () => {
		const missingOrigin = await contactHandler.fetch(
			makeRequest(normalFields(), null)
		);
		assert.equal(missingOrigin.status, 403);

		const foreignOrigin = await contactHandler.fetch(
			makeRequest(normalFields(), "https://example.com")
		);
		assert.equal(foreignOrigin.status, 403);
	});

	await t.test(
		"silently discards honeypot and instant submissions",
		async () => {
			delete process.env.RESEND_API_KEY;

			const honeypot = await contactHandler.fetch(
				makeRequest(normalFields({ company: "Acme Corporation" }))
			);
			assert.equal(honeypot.status, 200);

			const tooFast = await contactHandler.fetch(
				makeRequest(normalFields({ form_started_at: String(Date.now()) }))
			);
			assert.equal(tooFast.status, 200);
		}
	);

	await t.test("silently discards the recurring canned spam", async () => {
		delete process.env.RESEND_API_KEY;
		const response = await contactHandler.fetch(
			makeRequest(
				normalFields({
					name: "James Smith",
					email: "sototiffanie@gmail.com",
					message:
						"I would like more information. Please contact me by email — anthony rosen.",
				})
			)
		);
		assert.equal(response.status, 200);
	});

	await t.test(
		"sends valid messages with a stable deduplication key",
		async () => {
			process.env.RESEND_API_KEY = "re_test";
			const idempotencyKeys: string[] = [];
			globalThis.fetch = async (_input, init) => {
				const headers = new Headers(init?.headers);
				idempotencyKeys.push(headers.get("Idempotency-Key") || "");
				return new Response(JSON.stringify({ id: "email_test" }), {
					status: 200,
				});
			};

			const fields = normalFields();
			const first = await contactHandler.fetch(makeRequest(fields));
			const second = await contactHandler.fetch(makeRequest(fields));

			assert.equal(first.status, 200);
			assert.equal(second.status, 200);
			assert.equal(idempotencyKeys.length, 2);
			assert.match(idempotencyKeys[0], /^contact\/v1\/[a-f0-9]{64}$/);
			assert.equal(idempotencyKeys[0], idempotencyKeys[1]);
		}
	);
});

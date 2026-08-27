# Google Analytics and Job-Search Events

Last verified: August 27, 2026

This is the plain-English record of what `anthonyrosen.com` measures, where the events come from, and how to check them in Google Analytics 4 (GA4).

## Current setup

- **Google Analytics property:** `G-7LRLJTJG4L`
- **Primary purpose:** understand which portfolio content people view and which actions suggest job or project interest.
- **Consent:** Google Analytics, PostHog, LinkedIn Insight Tag, and RB2B load only after a visitor accepts analytics cookies.
- **Performance:** the analytics scripts wait until the page is idle or the visitor interacts, so they stay out of the initial page load.
- **Single-page navigation:** Home, Resume, Portfolio, Style Guide, and Colophon send their own virtual pageviews even though the browser does not do a full page reload.
- **Shared event names:** the job-search events below are sent to both GA4 and PostHog after consent.

## Live GA4 account check

Checked in the `anthonyrosen.com` GA4 property on August 27, 2026:

- The **Anthony Rosen CV** web stream is active and receiving traffic.
- The stream URL is `https://www.anthonyrosen.com` and its measurement ID matches the website: `G-7LRLJTJG4L`.
- GA4 has recently received its standard events, including `page_view`, `first_visit`, `session_start`, `scroll`, and `user_engagement`.
- The new job-search events have not appeared in the GA4 Recent Events list yet. They need one consented live test after this update is deployed.
- GA4’s browser-history pageview option is off. Normal page loads still count, while the site sends its own descriptive virtual pageviews for Home, Resume, Portfolio, Style Guide, and Colophon.
- Event-scoped custom dimensions are registered for `link_location`, `contact_method`, and `file_format` so those details can be used in reports.
- The Internal Traffic filter is active. Tests from Anthony’s internal network are intentionally excluded from Realtime and processed reports.
- The currently marked key events are generic lead/purchase placeholders with no stream data. The job-search key events listed below should replace the useful part of that setup once GA4 has received them.

## Events sent by the site

| Event | What it means | Useful details included |
| --- | --- | --- |
| `page_view` | A visitor opened Home, Resume, Portfolio, Style Guide, or Colophon. | `page_path`, `page_title`, `page_location` |
| `contact_dialog_open` | A visitor opened the “Let’s talk” popup. | `link_location` such as `hero` |
| `schedule_click` | A visitor intentionally selected the Schedule a Call tab. The scheduler appearing by default is not counted as a click. | `contact_method: calendar`, `link_location`, `event_duration_minutes: 15` |
| `contact_form_submit` | The contact form reported a successful send. Failed or incomplete submissions are not counted. | `contact_method: form`, `link_location` |
| `contact_copy` | A visitor copied the email address or phone number. | `contact_method: email` or `phone`, `link_location` |
| `contact_click` | A visitor pressed the mail icon or phone icon, opening their email or call app. | `contact_method: email` or `phone`, `link_location` |
| `linkedin_click` | A visitor opened Anthony’s LinkedIn profile. | `link_location`, `link_text` |
| `resume_download` | A visitor followed a real PDF or DOCX résumé file link. Placeholder links are ignored. | `file_format`, `link_location` |
| `portfolio_open` | A visitor opened the Portfolio view. | `link_location`, `link_text` |

`link_location` separates actions taken in the `hero`, `contact_dialog`, `footer`, `navigation`, `resume`, `portfolio`, or general `page` area.

## Recommended GA4 key events

In **Google Analytics → Admin → Events**, mark these as key events:

1. `contact_form_submit` — strongest signal that someone reached out.
2. `schedule_click` — strong scheduling intent, but not proof that a meeting was booked.
3. `resume_download` — useful job-search intent after real résumé files are connected.

Keep `contact_dialog_open`, `contact_copy`, `contact_click`, `linkedin_click`, and `portfolio_open` as supporting events. They are valuable for understanding the path to a contact, but treating every small interaction as a conversion makes the report noisy.

## How to verify the events

1. Open the live site in a private window so the visit is easy to recognize.
2. Accept analytics cookies.
3. In GA4, open **Reports → Realtime**.
4. On the site, perform one action at a time: open the contact popup, select the Schedule tab, copy the email, copy the phone number, or open the Resume and Portfolio views.
5. Allow up to a minute for Realtime to show the event. Normal Events reports can take much longer to populate.
6. Open an event in Realtime and confirm its details include the expected `link_location` and, where applicable, `contact_method`.

Do not submit a fake contact form merely to test reporting; it sends a real email. The form event is intentionally recorded only after the message service confirms success. The current résumé menu contains placeholder links, so it does not send `resume_download` until real files are connected.

## Consent behavior

- Before acceptance, pageviews and contact interactions are discarded rather than saved for later.
- After acceptance, the current page is recorded once and future eligible actions are tracked.
- If a visitor declines, the analytics services do not load.

## Files that control the setup

- GA4 initialization and consent: `src/layouts/Layout.astro`
- Virtual pageviews: `src/pages/index.astro`
- Job-search events: `src/components/JobSearchAnalytics.astro`
- Popup/footer copy, form, and scheduler triggers: `src/components/ContactDialog.astro`
- Cookie choice: `src/components/CookieBanner.astro`
- PostHog: `src/components/PostHog.astro`
- LinkedIn Insight Tag: `src/components/LinkedInTag.astro`
- RB2B: `src/components/RB2B.astro`

## Verification checklist

- [x] GA4 measurement ID is present.
- [x] GA4’s automatic initial pageview is disabled in the website code.
- [x] Virtual pageviews are sent for the site’s view-switching navigation.
- [x] Popup, footer, scheduler, form, email, phone, LinkedIn, résumé-view, and portfolio paths have event coverage.
- [x] A form event fires only after a successful response from the contact endpoint.
- [x] Analytics activity is blocked before consent.
- [x] The GA4 stream URL and measurement ID match the live site.
- [x] GA4 reports that the stream is receiving traffic.
- [x] Enhanced measurement for page changes based on browser history events is off.
- [x] `link_location`, `contact_method`, and `file_format` are registered as event-scoped custom dimensions.
- [x] A consented test generated popup, copy, scheduler, portfolio, and virtual-pageview events with the Google tag loaded and no browser errors.
- [x] GA4’s active Internal Traffic filter correctly excluded the internal test visit from Realtime.
- [ ] Confirm the custom events with the next consented non-internal visit.
- [ ] Mark `contact_form_submit` and `schedule_click` as key events after GA4 receives them.
- [ ] Connect real PDF/DOCX résumé files before enabling `resume_download` as a key event.

## Maintenance note

If the GA4 property changes, update `G-7LRLJTJG4L` in `src/layouts/Layout.astro`. Event names should remain stable so reports continue to compare cleanly over time.

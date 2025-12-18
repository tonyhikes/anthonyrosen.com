# Analytics Setup Guide

This document outlines the analytics stack implemented on `anthonyrosen.com` to track user behavior, pageviews, and B2B visitor identity.

## 🛠 Analytics Stack

### 1. PostHog (Primary User Intelligence)

PostHog is used for detailed behavioral analytics, session recordings, and custom event tracking.

- **Pageviews**: Tracked as virtual pageviews in the SPA-like navigation.
- **Session Recordings**: Enabled to watch user interactions (masked for privacy).
- **Heatmaps**: Available via the PostHog toolbar.
- **Custom Events**:
  - `contact_me_clicked`: Clicks on the email link in the footer.
  - `linkedin_profile_clicked`: Clicks on the LinkedIn footer link.
  - `resume_downloaded`: Tracks PDF/DOCX downloads.

### 2. Google Analytics 4 (GA4)

Used for high-level traffic source analysis and basic pageview tracking.

- Integrated via **Partytown** to ensure zero impact on page load speed.

### 3. B2B Identification

- **LinkedIn Insight Tag**: Captures professional demographics (Company, Job Title) of visitors.
- **RB2B**: Identifies specific LinkedIn profiles of visitors (primarily US-based).

## 🚀 How to Maintenance

### Changing Tracking IDs

If you need to change your tracking IDs, edit the following files:

- **GA4 ID**: `src/layouts/Layout.astro` (Search for `G-7LRLJTJG4L`)
- **PostHog ID**: `src/components/PostHog.astro`
- **LinkedIn Partner ID**: `src/components/LinkedInTag.astro`
- **RB2B Script ID**: `src/components/RB2B.astro`

### 💡 How to get your LinkedIn Partner ID

Since you are using a personal account, you'll need to access LinkedIn's **Campaign Manager** (it's free to create an account for this purpose):

1.  **Open Campaign Manager**: Go to [LinkedIn Campaign Manager](https://www.linkedin.com/campaignmanager/accounts).
2.  **Create an Ad Account**: If you don't have one, follow the prompts to create a basic account. You don't need to run any ads to use the Insight Tag.
3.  **Navigate to Insight Tag**: In the top menu, go to **Analyze** > **Insight Tag**.
4.  **Create Tag**: Click **Create Insight Tag** (if not already created).
5.  **Get the ID**:
    - Click **I will use a tag manager**.
    - You will see your **Partner ID**. It is a 7-digit number (e.g., `1234567`).
6.  **Update your code**: Copy that ID and paste it into `src/components/LinkedInTag.astro` where it says `REPLACE_WITH_YOUR_ID`.

### Performance

All tracking scripts (GA4, PostHog, LinkedIn, RB2B) are loaded via **Partytown** or deferred methods to maintain a 100/100 PageSpeed score.

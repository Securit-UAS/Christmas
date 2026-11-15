# Alps 2026 — V18 Road Trip Challenge

## Deploy
Upload the new `index.html`, `styles.css`, `roadtrip.js`, `roadtrip-challenges.json` and `roadtrip-results.json` alongside the existing site files. Keep `script.js` and the Secret Santa backend unchanged. Keep the background images.

The page must be served over HTTP(S) (for example GitHub Pages); browser `file://` previews cannot fetch JSON reliably. A local test server works: `python3 -m http.server 8000`.

## Daily WhatsApp workflow
1. A participant opens a challenge and taps **Claim on WhatsApp**; they choose the existing Joyeux Noel group, send the prepared claim and then post the relevant image/video. The website cannot attach media automatically.
2. Two other group members reply `CONFIRMED` to the **original claim**. Unclear replies, reactions and unattached media should be manually reviewed, not assumed valid.
3. Admin exports the day's WhatsApp conversation with media and uploads it to ChatGPT with the **existing results JSON**. ChatGPT should propose claim changes for human review, not automatically assume WhatsApp timestamps establish truth.
4. Approved claims are added to `roadtrip-results.json`. Upload/publish the new file to the same directory on GitHub Pages. All visitors see new scores on their next reload.
5. The expandable on-site results importer lets an admin preview and validate a results JSON, and download the result. Importing does **not** publish or sync remotely.

## Result schema
`version`: 1; `updatedAt`: ISO 8601 timestamp or null; `dailySummary`: short public-safe text; `claims`: array.
Each claim requires `id` (unique safe alphanumeric ID, hyphens/underscores allowed), `challengeId` from `roadtrip-challenges.json`, `participant` (John, Emma, Lee, Sarah, Callum, Holly, Cain, Dexter or Myles), `status` (`pending`, `approved`, `rejected`), `timestamp` ISO 8601, and `confirmedBy` an array of two other, distinct named participants for approved claims. Optional `note` is for private adjudication, not shown publicly.

Example (illustrative only — DO NOT publish as a real claim):
```json
{
  "version": 1,
  "updatedAt": "2026-12-19T15:30:00+01:00",
  "dailySummary": "The competition has begun.",
  "claims": [
    {"id":"FR-02-20261219-001","challengeId":"FR-02","participant":"Emma","status":"approved","timestamp":"2026-12-19T14:20:00+01:00","confirmedBy":["John","Lee"]}
  ]
}
```

## Important implementation boundaries
- The website **does not access WhatsApp**, validate media, or import a chat ZIP on its own; daily adjudication happens outside the website.
- Results are published as a **static JSON file**. No separate Power Automate backend is required for v18; adding one later would enable server-side submission and approval.
- The leaderboard uses participant names only and intentionally does not publish private Secret Santa profiles, WhatsApp messages, numbers or photos.
- Only `approved` claims count. Every approved claim needs two independent confirmations, excluding the claimant. For `first` challenges only one approved winner is permitted. For `any` challenges each participant may score once.
- Challenge codes use a hyphen (e.g. `#FR-02`) and `#ALPS26` to ease text search in chat exports.
- WhatsApp share links may ask the user to select the group manually. Photos/videos are separately attached by users.

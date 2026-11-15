# Alps 2026 — V20 Road Trip daily scoring

## WhatsApp → evening review → next-day 08:00 Alpine reveal

1. Everyone uses the **Claim on WhatsApp** button in the website. This pre-fills a `#ALPS26 #CHALLENGE-ID` message; they choose the existing group and send, then attach the photo/video in or immediately after the claim. Two other people should reply `CONFIRMED` to the original claim, where possible.
2. Each evening (or before 08:00 next morning), export the WhatsApp chat **including media** and provide it along with the **latest published roadtrip-results.json** to ChatGPT. ChatGPT assesses new claims, photo associations, and independent confirmations, reports ambiguities, and proposes the next snapshot for your review. **Do not publish unverified claims as approved**.
3. Ask ChatGPT for a **complete updated `roadtrip-results.json` (version 2)** to upload to GitHub, plus a separate humorous daily WhatsApp roundup in an AI-referee voice. The roundup is not automatically sent.
4. Put the next day's snapshot in `releases[]` with `publishAt` equal to **08:00 Europe/Paris**, using `+01:00` in winter or `+02:00` in summer, e.g. `2026-12-20T08:00:00+01:00`. Preserve every earlier release entry. Each release `results` object is a **complete cumulative snapshot**, not a list of changes. All releases must pass the regular V18 claim rules.
5. Upload only the updated `roadtrip-results.json` to the GitHub Pages repository (same directory as `index.html`). The live site checks for updates every minute and counts down to the next 08:00 Alpine reveal. A page left open updates at reveal time, subject to network availability. GitHub Pages publishing and browser caching can delay availability.

## Scheduled file schema
```json
{
  "version": 2,
  "releases": [
    {
      "publishAt": "2026-12-20T08:00:00+01:00",
      "results": {
        "version": 1,
        "updatedAt": "2026-12-20T08:00:00+01:00",
        "dailySummary": "A short, family-friendly AI referee verdict.",
        "claims": []
      }
    }
  ]
}
```

For individual claim fields and scoring safeguards see V18 documentation: `id`, `challengeId`, `participant`, `status`, `timestamp`, `confirmedBy`; approved claims need two **other** distinct participants, first-to-spot awards cannot be duplicated, repeatable challenges award once per participant. Leave disputed submissions pending.

## Deployment and caveat
Upload `index.html`, `styles.css`, `roadtrip.js`, `roadtrip-challenges.json`, `roadtrip-results.json` plus the existing website files, keeping the existing Secret Santa code and endpoints unchanged. The previous V18/V19 `roadtrip-results.json` format (version 1) remains readable as a legacy immediate-publication file; use version 2 for daily scheduling.

**Important:** This is a timed **display**, not a secure embargo. Since GitHub Pages serves `roadtrip-results.json` publicly, anyone who directly visits that file can read future scheduled results before 08:00. If strict secrecy is required, add a GitHub Actions scheduled publication workflow or a backend which releases the data at 08:00. The browser clock is used to trigger rendering; the site does not run a server-side scheduler. Keep WhatsApp raw messages/media/private profiles out of public files.

## V21 pre-trip and evidence rules
- **Pre-trip:** PRE-01 through PRE-16 are household missions, each awardable once per household. KID-01 through KID-04 are personal child bonuses, once per child. PRE-17 is a single voted wildcard winner. Pre-trip points carry forward into the main competition.
- **Video:** Evidence videos must be **under one minute** (strictly less than 60 seconds). Where video duration cannot be established from available exported metadata, flag for manual review, rather than assuming compliance.
- **Audio:** The AI referee **does not listen to, transcribe or score sound**. Speech, pronunciation and music tasks require independent human confirmation, which can be recorded in text in the WhatsApp chat.
- Family mission awards are shown under the claiming participant's name on the individual leaderboard, but limited to one approved claim per household. Household definitions are in `roadtrip.js`; update there if family membership changes.
- Photos and video from WhatsApp may be unavailable in exports; do not award points when evidence or confirmation is inadequate.

## V22 participation and confirmations
- Encourage WhatsApp reactions to claims, but ask for a **reply to the original claim stating `CONFIRMED`** wherever possible; exported reactions may be missing. Count only confirmations from distinct other participants who actually witnessed/can verify the claim.
- At most **-5 points per day** may be deducted for repeated, clear, avoidable non-participation. This is **manual review only**: never infer non-participation solely from missing reactions or from silence, and don't penalise someone who was busy or couldn't verify a claim. No requirement to approve false/uncertain claims.
- **Myles is fully exempt**, including from the expectation to react or confirm. No penalty for him will be accepted by the website validator.
- Under each cumulative snapshot's `results`, optional `adjustments` entries record penalties. These are cumulative, unique by participant/date, and persist to later snapshots, e.g.:
```json
"adjustments": [{"id":"pen-2026-12-20-john","participant":"John","date":"2026-12-20","points":-5,"reason":"non-participation","note":"Example only: adjudicator confirmed repeated deliberate refusal despite multiple independently verifiable claims."}]
```
- A validated penalty appears in the leaderboard total and history. Do not invent deductions from chat exports.

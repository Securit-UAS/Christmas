# Alps 2026 — GitHub Pages frontend

Static frontend for the Bewsey • Wilkinson • Redgwell Alps 2026 family road-trip app.

## Current live integration
The Secret Santa entry now includes a real participant/PIN login wired to the Power Automate development endpoint. Successful logins store the returned participant name, session token, expiry, profile status and gift status in browser localStorage.

## Publish
Upload `index.html`, `styles.css` and `script.js` to the root of the GitHub Pages repository and enable Pages for that branch/folder.

## Development security note
The current Power Automate Shared Access URL is intentionally embedded for development and therefore visible to anyone who can inspect the site's JavaScript. Rotate the trigger URL/signature before final release and apply the intended API security controls.

## Next backend work
1. Browser/CORS test from GitHub Pages.
2. Session validation endpoint for authenticated actions.
3. Secret Santa profile save/read.
4. Central draw/reveal.
5. AI gift ideas.
6. Challenge/Jotform integration and leaderboard.


## v3 — Secret Santa profile
- Adds the live Secret Santa dossier/questionnaire.
- Saves through the `Alps 2026 - Save Profile` Power Automate endpoint using the current ParticipantID + SessionToken.
- Successful save updates local profile status immediately.
- Existing-profile loading is deliberately the next backend step; until then, re-saving replaces the Excel profile.


## Build v9
- Visible BUILD V14 marker at top of page.
- Critical Secret Santa/profile JavaScript is embedded directly in index.html to remove external script caching as a variable.
- Direct onclick fallbacks on Secret Santa/profile buttons.
- Profile form is hidden while saved data loads and displays an explicit load error instead of a misleading blank form.


## V14
- Reveal My Person now calls the authenticated Reveal Secret Santa Power Automate endpoint.
- Shows a loading state while Excel/Power Automate responds.
- Displays only the logged-in participant’s assigned recipient and populated profile fields.
- Empty recipient profiles get a clear waiting message rather than blank boxes.

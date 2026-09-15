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

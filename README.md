# Rudrax Cinema — Live Seat Sync

This version uses a shared Node.js + SQLite backend instead of browser localStorage.

## Run
- Node.js 18+
- `npm install`
- `npm start`
- Customer: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin.html`

## Deploy
Deploy this whole folder to a Node.js host (for example Render/Railway/Fly.io) with `npm start`. GitHub Pages alone cannot run the Node/SQLite backend.

After deployment, the customer site and admin use the same database. The APK must open the deployed customer URL, not an old packaged HTML copy.

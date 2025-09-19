# CocaWorld — Deployable starter (React + Express)

This repository contains:
- Frontend: Vite + React single-page app (`/src`)
- Simple backend: Express server (`/server`) to persist characters and provide short share links + QR generation
- Deployment helpers for Vercel / Netlify
- Basic SEO meta in `index.html`

## Quick local run (development)

1. Install dependencies
```bash
cd cocaworld_project
npm install
```

2. Start the backend (server)
```bash
npm run server
# server listens on port 4000 by default
```

3. In a new terminal, start the frontend
```bash
npm run dev
# vite dev server typically runs on http://localhost:3000
```

4. To test saving characters, use the Create Character screen. The front-end will POST to `/api/character`.

## Deployment (Vercel recommended)

1. Push this repo to a Git provider (GitHub/GitLab).
2. On Vercel, import the repo.
3. Set `SITE_BASE` environment variable in Vercel to your production domain, e.g. `https://your-site.com`
4. Vercel will build the frontend; the Express server is included for potential serverless functions (you can extract endpoints to a Serverless Function).

## Google OAuth (to enable real Google Sign-in)

1. Go to Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client ID.
2. Choose "Web application" and add authorized origins:
   - `https://your-site.com`
   - `http://localhost:3000`
3. Add authorized redirect URIs if using server-side flow.
4. Copy the Client ID and add it to your frontend. Replace the `GoogleSignIn` mock in `src/App.jsx` with Google's Identity Services code (or use `react-google-login` library).

## QR codes & Sharing

- The server returns a `qr` Data URL after saving a character. You can display or export that image for printing on bottles.
- QR redirects to `/character/:id` which is indexable by Google once the site is public and reachable.

## Next steps I can do for you (pick any or I'll proceed):
- Integrate real Google OAuth into frontend (need Client ID) — I can modify `src/App.jsx`.
- Deploy to Vercel and configure domain & environment variables (I will provide exact steps and required config).
- Generate printable high-res QR images for N characters (I can produce PNGs for each character if you give character data).
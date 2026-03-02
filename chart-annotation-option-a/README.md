# Chart Annotation UI (Option A)

This repo contains a **working, runnable** setup:

- `frontend/`: React + Vite UI hosted on GitHub Pages (static)
- `worker/`: Cloudflare Worker backend endpoint (`/submit`) that stores submissions in KV.
  - **Optional**: if you set GitHub env vars, it will also create a GitHub Issue per submission.

## Prereqs
- Node.js 18+ (recommended)
- npm
- (Optional) Cloudflare account if you later deploy the Worker to production.

## Run locally (2 terminals)

### Terminal 1 — Worker
```bash
cd worker
npm install
npm run dev
```
This starts a local Worker at `http://127.0.0.1:8787`.

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL it prints (usually `http://127.0.0.1:5173`).

The UI is pre-wired to submit to the local worker: `http://127.0.0.1:8787/submit`.

## Where submissions go
- Locally: the Worker writes to KV (local dev storage). The response includes a `submissionId`.
- If you also set GitHub env vars, it will attempt to create a GitHub Issue.

## Enable GitHub Issue creation (optional)
In `worker/.dev.vars` (local) or Cloudflare Worker secrets (prod), set:

```
GITHUB_TOKEN=ghp_... (token with repo:issues permission)
GITHUB_OWNER=your-org-or-user
GITHUB_REPO=your-repo
```

## Modify stimuli
Images live in `frontend/public/stimuli/`. Two placeholder chart images are included.
Update `frontend/src/data/pairs.ts` to point to your own images and prompts.

## Deploy
- Frontend: build with `npm run build` in `frontend/` and deploy the `dist/` output to GitHub Pages.
- Worker: deploy with `npm run deploy` in `worker/` (requires Cloudflare auth).

---

### Notes
GitHub Pages is static-only, so the backend must be external. This is why the Worker exists.

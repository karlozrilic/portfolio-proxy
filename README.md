# Next.js GitHub Pages Proxy
 
A lightweight serverless proxy deployed on Vercel. It sits between my static GitHub Pages site and external APIs, solving CORS restrictions without a full backend.
 
## Why this exists
 
GitHub Pages only serves static files — it has no server. When my frontend tries to call external APIs directly, browsers block the request due to CORS policy. This proxy forwards those requests server-side where CORS doesn't apply.
 
```
Browser (GitHub Pages) → Proxy (Vercel) → External API
```
 
## Project structure
 
```
my-proxy/
├── api/
│   ├── utils/
│   │   └── with_proxy.ts     # CORS and authorization helper in one
│   │   └── cors_headers.ts   # Shared CORS helper
│   │   └── authorization.ts  # Authorization helper
│   └── endpoint.ts           # One file = one endpoint
├── package.json
└── tsconfig.json
```
 
## Setup
 
**Install dependencies**
 
```bash
npm install
```
 
**Environment variables**
 
Create a `.env` file locally for development:
 
```env
ALLOWED_ORIGIN=https://yourusername.github.io
```
 
On Vercel, add the same variables under **Project → Settings → Environment Variables**.
 
## Adding a new endpoint
 
Each file in `api/` automatically becomes an endpoint. To add a new one:
 
1. Create `api/your-endpoint.ts`
2. Import the CORS helper and fetch your data
3. Deploy

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setCorsHeaders } from './utils/cors_headers'
 
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders();
  const response = await fetch('https://external-api.com/data');
  const data = await response.json();
  return res.status(200).json(data);
};
```

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withProxy } from './utils/with_proxy';

export default withProxy(async (req: VercelRequest, res: VercelResponse) => {
    const response = await fetch('https://external-api.com/data');
    const data = await response.json();
    return res.status(200).json(data);
});
```
 
## Endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/countries` | Returns list of all countries |
 
## Deployment
 
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables in Vercel dashboard
4. Deploy — your proxy is live at `https://your-project.vercel.app`
Vercel auto-deploys on every push to `main` | `master`.
 
## Local development
 
```bash
npm install -g vercel
vercel dev
```
 
This starts a local server at `http://localhost:3000` that mimics the Vercel environment.
 
## Calling the proxy from your frontend
 
```ts
const res = await fetch('https://your-project.vercel.app/api/countries')
const data = await res.json()
```
 
## Notes
 
- Vercel free tier allows 100k function invocations/month — more than enough for a personal portfolio
- Each function has a 10s execution timeout on the free tier
- API keys should always go in environment variables, never hardcoded
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { setCorsHeaders } from './utils/cors_headers.js';

const REPO = 'karlozrilic/karlozrilic.github.io';
const WORKFLOW = 'deploy.yml';

// Google's public keys for Firebase ID tokens
const firebaseKeys = createRemoteJWKSet(
    new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

// Only a signed-in admin can trigger a rebuild of the portfolio site.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const githubToken = process.env.GITHUB_TOKEN;
    const admins = (process.env.ADMIN_EMAILS ?? '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);

    if (!projectId || !githubToken || !admins.length) {
        return res.status(500).json({ error: 'Publish is not configured' });
    }

    const token = req.headers.authorization?.replace(/^Bearer /, '');
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { payload } = await jwtVerify(token, firebaseKeys, {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
        });
        const email = String(payload.email ?? '').toLowerCase();
        if (payload.email_verified !== true || !admins.includes(email)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
    } catch {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const response = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ ref: 'master' }),
    });

    if (!response.ok) {
        return res.status(502).json({ error: `GitHub responded with ${response.status}` });
    }

    return res.status(202).json({ ok: true });
}

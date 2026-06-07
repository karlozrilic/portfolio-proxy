import { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGINS = [
    process.env.ALLOWED_ORIGIN,
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean) as string[];

export function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin || '';

    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'x-proxy-secret');
}
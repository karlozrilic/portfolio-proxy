import { VercelResponse } from '@vercel/node';

export function setCorsHeaders(res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
}
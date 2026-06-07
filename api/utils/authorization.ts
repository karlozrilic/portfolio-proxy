import { VercelRequest } from '@vercel/node';

export function isAuthorized(req: VercelRequest): boolean {
    const token = req.headers['x-proxy-secret'];
    return token === process.env.PROXY_SECRET;
}
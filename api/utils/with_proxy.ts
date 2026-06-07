import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders } from './cors_headers';
import { isAuthorized } from './authorization';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse | void>;

export function withProxy(handler: Handler) {
    return async (req: VercelRequest, res: VercelResponse) => {
        setCorsHeaders(req, res);

        if (!isAuthorized(req)) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        return handler(req, res);
    }
}
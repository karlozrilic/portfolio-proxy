import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withProxy } from './utils/with_proxy.js';

export default withProxy(async (req: VercelRequest, res: VercelResponse) => {
    const response = await fetch('https://www.apicountries.com/countries');
    const data = await response.json();
    return res.status(200).json(data)
});
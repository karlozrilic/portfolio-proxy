// Run with: npx tsx scripts/publish_check.mts
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
const { default: handler } = await import('../api/publish.ts');

function call(req: any) {
    return new Promise<{ status: number, body: any }>(resolve => {
        const res: any = { headers: {}, setHeader(k: string, v: string) { this.headers[k] = v; },
            status(code: number) { return { json: (body: any) => resolve({ status: code, body }), end: () => resolve({ status: code, body: null }) }; } };
        handler({ headers: { origin: 'http://localhost:3000', ...req.headers }, method: req.method } as any, res);
    });
}

process.env.FIREBASE_PROJECT_ID = 'portfolio-cfbc1';
process.env.GITHUB_TOKEN = 'not-used-in-these-checks';
process.env.ADMIN_EMAILS = 'kazrile@gmail.com';

assert.equal((await call({ method: 'OPTIONS' })).status, 204);
assert.equal((await call({ method: 'GET' })).status, 405);
assert.equal((await call({ method: 'POST' })).status, 401);
assert.equal((await call({ method: 'POST', headers: { authorization: 'Bearer garbage' } })).status, 401);

// a correctly shaped token for the right project, but signed by someone else's key
const { privateKey } = await generateKeyPair('RS256');
const forged = await new SignJWT({ email: 'kazrile@gmail.com', email_verified: true })
    .setProtectedHeader({ alg: 'RS256', kid: 'fake' })
    .setIssuer('https://securetoken.google.com/portfolio-cfbc1').setAudience('portfolio-cfbc1')
    .setIssuedAt().setExpirationTime('1h').sign(privateKey);
assert.equal((await call({ method: 'POST', headers: { authorization: `Bearer ${forged}` } })).status, 401);

delete process.env.ADMIN_EMAILS;
assert.equal((await call({ method: 'POST', headers: { authorization: 'Bearer x' } })).status, 500);

console.log('all publish checks passed');

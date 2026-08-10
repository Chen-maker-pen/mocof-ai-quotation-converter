/**
 * Vercel file-system catch-all for every nested MOCOF API path.
 *
 * This preserves `/api/convert`, `/api/quotes/:id`, and all other Express
 * paths.  It replaces the fragile rewrite-to-`/api` approach, which can make
 * Express receive `/api` instead of the original nested request path.
 */
// See api/index.ts: Vercel traces extensionless TypeScript imports, while a
// literal `.ts` specifier becomes a missing `/var/task/server.ts` at runtime.
import { createApp } from '../server';

export const config = {
  api: {
    // Multer must receive the raw multipart stream for quotation uploads.
    bodyParser: false,
  },
};

const appPromise = createApp();

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}

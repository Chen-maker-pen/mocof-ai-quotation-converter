/** Vercel serverless entry point for all MOCOF /api routes. */
// Vercel executes the compiled JavaScript files in the serverless bundle.
// Import the emitted module explicitly; `.ts` and extensionless imports are
// left as invalid runtime paths in this project because `server/` is also a
// directory containing the API dependencies.
import { createApp } from '../server.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const appPromise = createApp();

export default async function handler(req: any, res: any) {
  // Vercel's rewrite below sends nested API routes through this single
  // serverless entry point. Restore the original route before Express sees
  // the request, e.g. `/api/quotes/quote-101` rather than `/api`.
  const rewrittenPath = req.query?.__mocof_path;
  if (typeof rewrittenPath === 'string' && rewrittenPath.trim()) {
    const query = new URLSearchParams(req.query as Record<string, string>);
    query.delete('__mocof_path');
    const suffix = query.toString();
    req.url = `/api/${rewrittenPath.replace(/^\/+/, '')}${suffix ? `?${suffix}` : ''}`;
  }
  const app = await appPromise;
  return app(req, res);
}

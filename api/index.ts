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
  const app = await appPromise;
  return app(req, res);
}

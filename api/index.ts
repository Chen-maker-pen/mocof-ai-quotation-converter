/** Vercel serverless entry point for all MOCOF /api routes. */
import { createApp } from '../server.ts';

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

/** Vercel serverless entry point for all MOCOF /api routes. */
// Extensionless imports let Vercel bundle this TypeScript module and all of
// its dependencies into the serverless function.  A literal `server.ts`
// import is left behind in the deployed JavaScript and fails at runtime.
import { createApp } from '../server';

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

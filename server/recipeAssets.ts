import { gunzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
export interface RecipeAsset {
  area: number;
  sourceDocument: string;
  sourceSha256: string;
  steps: Array<{id: string; text: string; lines: Array<{id: string; text: string; location: string}>}>;
}
interface RecipeAssets {catalog: RecipeAsset[]; logo: string}
// Official documents and their embedded brand artwork stay outside the public
// repository. Only the background worker needs this private configuration.
function loadAssets(): RecipeAssets {
  const encoded = [1,2,3,4,5].map(n=>process.env[`MOCOF_RECIPE_ASSETS_${n}`] || '').join('');
  const local = process.env.MOCOF_RECIPE_ASSETS_FILE;
  if (!encoded && !local) return {catalog: [], logo: ''};
  const json = encoded ? gunzipSync(Buffer.from(encoded,'base64')).toString('utf8') : readFileSync(local!,'utf8');
  const parsed=JSON.parse(json) as RecipeAssets;
  if(!Array.isArray(parsed.catalog)||typeof parsed.logo!=='string')throw Error('Invalid private recipe configuration.');
  return parsed;
}
export const recipeAssets=loadAssets();

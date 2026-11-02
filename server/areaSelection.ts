import {normalizeArea2} from './area2Source.js';

/** Detect the supported two-room layout before queuing a different recipe. */
export async function validateAreaSelection(raw: Buffer, area: number) {
  if (area === 2) return;
  let twoRooms = false;
  try { await normalizeArea2(raw); twoRooms = true; } catch { /* Other layouts use their own recipe validation. */ }
  if (twoRooms) throw new Error(`This workbook matches the two-room layout (Area 2), but Area ${area} is selected. Select Area 2 and run again. The original file has not been changed.`);
}

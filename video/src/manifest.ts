import raw from './shots-manifest.json';
import type { BlockKey, Device } from './scenes';

export type Shot = { file: string; heading: string | null; matchedBy: 'primary' | 'fallback' } | null;

type Manifest = { url: string | null; shots: Partial<Record<BlockKey, Partial<Record<Device, Shot>>>> };
const manifest = raw as unknown as Manifest;

export const getShot = (block: BlockKey, device: Device): Shot => manifest.shots[block]?.[device] ?? null;

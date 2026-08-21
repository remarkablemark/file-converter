export const FFMPEG_CORE_VERSION = '0.12.10';

export const FFMPEG_CORE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.js`;

export const FFMPEG_WASM_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm/ffmpeg-core.wasm`;

export const ALLOWED_CDN_PREFIX = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/`;

export const LARGE_FILE_THRESHOLD_BYTES = 100 * 1024 * 1024;

export const SUPPORTED_CATEGORIES = ['image', 'video', 'audio'] as const;

export type Category = (typeof SUPPORTED_CATEGORIES)[number];

import type { Category } from './constants';

export interface OutputFormat {
  value: string;
  label: string;
  mimeType: string;
  category: Category;
}

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'bmp',
  'ico',
  'svg',
  'tiff',
  'tif',
]);

const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'flv',
  'ogv',
  'm4v',
]);

const AUDIO_EXTENSIONS = new Set([
  'mp3',
  'wav',
  'ogg',
  'aac',
  'flac',
  'm4a',
  'wma',
  'oga',
]);

export const OUTPUT_FORMATS: OutputFormat[] = [
  { value: 'mp4', label: 'MP4', mimeType: 'video/mp4', category: 'video' },
  { value: 'webm', label: 'WebM', mimeType: 'video/webm', category: 'video' },
  {
    value: 'mov',
    label: 'MOV',
    mimeType: 'video/quicktime',
    category: 'video',
  },
  {
    value: 'avi',
    label: 'AVI',
    mimeType: 'video/x-msvideo',
    category: 'video',
  },
  {
    value: 'mkv',
    label: 'MKV',
    mimeType: 'video/x-matroska',
    category: 'video',
  },
  { value: 'gif', label: 'GIF', mimeType: 'image/gif', category: 'image' },
  { value: 'mp3', label: 'MP3', mimeType: 'audio/mpeg', category: 'audio' },
  { value: 'wav', label: 'WAV', mimeType: 'audio/wav', category: 'audio' },
  { value: 'ogg', label: 'OGG', mimeType: 'audio/ogg', category: 'audio' },
  { value: 'aac', label: 'AAC', mimeType: 'audio/aac', category: 'audio' },
  { value: 'flac', label: 'FLAC', mimeType: 'audio/flac', category: 'audio' },
  { value: 'm4a', label: 'M4A', mimeType: 'audio/mp4', category: 'audio' },
  { value: 'png', label: 'PNG', mimeType: 'image/png', category: 'image' },
  { value: 'jpg', label: 'JPEG', mimeType: 'image/jpeg', category: 'image' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp', category: 'image' },
  { value: 'bmp', label: 'BMP', mimeType: 'image/bmp', category: 'image' },
  { value: 'ico', label: 'ICO', mimeType: 'image/x-icon', category: 'image' },
];

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getCategory(file: File): Category | null {
  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  const extension = getFileExtension(file.name);

  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }

  if (AUDIO_EXTENSIONS.has(extension)) {
    return 'audio';
  }

  return null;
}

export function getOutputFormats(category: Category): OutputFormat[] {
  return OUTPUT_FORMATS.filter((format) => format.category === category);
}

export function getOutputFormat(value: string): OutputFormat | undefined {
  return OUTPUT_FORMATS.find((format) => format.value === value);
}

export function getDefaultOutputFormat(category: Category): string {
  switch (category) {
    case 'image':
      return 'png';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
  }
}

export function getMimeType(extension: string): string {
  const format = getOutputFormat(extension);
  return format?.mimeType ?? 'application/octet-stream';
}

import type {
  AudioOptions,
  ConversionOptions,
  ImageOptions,
  VideoOptions,
} from '../types/converter';
import type { Category } from './constants';
import { LARGE_FILE_THRESHOLD_BYTES } from './constants';
import { getFileExtension, getOutputFormat } from './formats';

export function isLargeFile(file: File): boolean {
  return file.size > LARGE_FILE_THRESHOLD_BYTES;
}

export function getMediaDimensions(
  file: File,
): Promise<{ height: number; width: number } | null> {
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    return Promise.resolve(null);
  }

  /* v8 ignore start */
  const isImage = file.type.startsWith('image/');
  const url = URL.createObjectURL(file);
  const element = isImage ? new Image() : document.createElement('video');
  element.src = url;

  return new Promise((resolve) => {
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    const handleLoad = () => {
      cleanup();
      const width = isImage
        ? (element as HTMLImageElement).naturalWidth
        : (element as HTMLVideoElement).videoWidth;
      const height = isImage
        ? (element as HTMLImageElement).naturalHeight
        : (element as HTMLVideoElement).videoHeight;
      resolve(width > 0 && height > 0 ? { width, height } : null);
    };

    const handleError = () => {
      cleanup();
      resolve(null);
    };

    element.addEventListener(isImage ? 'load' : 'loadedmetadata', handleLoad, {
      once: true,
    });
    element.addEventListener('error', handleError, { once: true });
  });
  /* v8 ignore stop */
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.slice(0, lastDot) : filename;
}

export function getOutputFilename(
  inputFilename: string,
  outputFormat: string,
): string {
  const base = getBaseName(inputFilename) || 'output';
  return `${sanitizeFilename(base)}.${outputFormat}`;
}

export function changeExtension(filename: string, extension: string): string {
  const base = getBaseName(filename) || 'output';
  return `${base}.${extension}`;
}

export function toFfmpegColor(color: string): string {
  if (color.startsWith('#') && color.length === 7) {
    return `0x${color.slice(1)}`;
  }
  return color;
}

export function createFileUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

export function revokeFileUrl(url: string | null): void {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function buildScaleFilter(
  width: number | undefined,
  height: number | undefined,
  fit: ImageOptions['fit'],
  background?: string,
): string | null {
  if (!width && !height) {
    return null;
  }

  const w = width ?? -1;
  const h = height ?? -1;

  if (!width || !height) {
    return `scale=${String(w)}:${String(h)}`;
  }

  switch (fit) {
    case 'contain': {
      const bg = background ? toFfmpegColor(background) : 'black';
      return `scale=${String(w)}:${String(h)}:force_original_aspect_ratio=decrease,pad=${String(w)}:${String(h)}:(ow-iw)/2:(oh-ih)/2:${bg}`;
    }
    case 'cover':
      return `scale=${String(w)}:${String(h)}:force_original_aspect_ratio=increase,crop=${String(w)}:${String(h)}`;
    case 'stretch':
    case 'force':
    default:
      return `scale=${String(w)}:${String(h)}`;
  }
}

export function mapImageQuality(quality: number): number {
  const clamped = Math.max(0, Math.min(100, quality));
  return Math.max(1, Math.round(31 - (clamped / 100) * 30));
}

export function buildAudioArgs(
  options: AudioOptions,
  outputFormat: string,
): string[] {
  const args: string[] = [];

  if (options.bitrate) {
    args.push('-b:a', options.bitrate);
  }

  if (options.sampleRate) {
    args.push('-ar', String(options.sampleRate));
  }

  args.push('-ac', options.channels === 'mono' ? '1' : '2');

  // Lossless FLAC quality hint when relevant
  if (outputFormat === 'flac') {
    args.push('-compression_level', '5');
  }

  return args;
}

export function buildImageArgs(
  options: ImageOptions,
  outputFormat: string,
): string[] {
  const args: string[] = [];

  const filter = buildScaleFilter(
    options.width,
    options.height,
    options.fit,
    options.background,
  );

  if (filter) {
    args.push('-vf', filter);
  }

  if (['jpg', 'jpeg', 'webp', 'gif'].includes(outputFormat)) {
    args.push('-q:v', String(mapImageQuality(options.quality)));
  }

  return args;
}

export function buildVideoArgs(
  options: VideoOptions,
  outputFormat: string,
): string[] {
  const args: string[] = [];

  const filter = buildScaleFilter(options.width, options.height, options.fit);

  if (filter) {
    args.push('-vf', filter);
  }

  if (options.fps) {
    args.push('-r', String(options.fps));
  }

  if (outputFormat === 'gif') {
    if (options.loop) {
      args.push('-loop', '0');
    }
  } else {
    if (outputFormat === 'webm') {
      args.push('-c:v', 'libvpx', '-deadline', 'good', '-cpu-used', '5');
    }

    args.push('-crf', String(options.quality));

    if (!options.preserveAudio) {
      args.push('-an');
    } else if (options.audioBitrate) {
      args.push('-b:a', options.audioBitrate);
    }
  }

  return args;
}

export function buildFFmpegArgs(
  inputName: string,
  outputFormat: string,
  category: Category,
  options: ConversionOptions,
): string[] {
  const args: string[] = ['-i', inputName];

  switch (category) {
    case 'image': {
      args.push(...buildImageArgs(options.image, outputFormat));
      break;
    }
    case 'video': {
      args.push(...buildVideoArgs(options.video, outputFormat));
      break;
    }
    case 'audio': {
      args.push(...buildAudioArgs(options.audio, outputFormat));
      break;
    }
  }

  return args;
}

export function getDefaultOptions(): ConversionOptions {
  return {
    image: {
      preserveAspectRatio: true,
      fit: 'contain',
      quality: 80,
      preserveTransparency: true,
      background: '#ffffff',
    },
    video: {
      preserveAspectRatio: true,
      fit: 'contain',
      quality: 23,
      preserveAudio: true,
      loop: false,
    },
    audio: {
      channels: 'stereo',
    },
  };
}

export function isValidOutputFormat(
  category: Category,
  outputFormat: string,
): boolean {
  const format = getOutputFormat(outputFormat);
  return format?.category === category;
}

export function getInputName(file: File): string {
  const extension = getFileExtension(file.name) || 'bin';
  return `input.${extension}`;
}

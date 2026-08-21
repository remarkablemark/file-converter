import type { Category } from '../utils/constants';

export interface ImageOptions {
  width?: number;
  height?: number;
  fit: 'contain' | 'cover' | 'stretch' | 'force';
  quality: number;
  preserveTransparency: boolean;
  background: string;
}

export interface VideoOptions {
  width?: number;
  height?: number;
  fit: 'contain' | 'cover' | 'stretch' | 'force';
  fps?: number;
  quality: number;
  preserveAudio: boolean;
  audioBitrate?: string;
  loop: boolean;
}

export interface AudioOptions {
  bitrate?: string;
  sampleRate?: number;
  channels: 'mono' | 'stereo';
}

export interface ConversionOptions {
  image: ImageOptions;
  video: VideoOptions;
  audio: AudioOptions;
}

export type OptionCategory = Exclude<Category, null>;

export interface ConverterState {
  file: File | null;
  category: Category | null;
  outputFormat: string;
  outputFilename: string;
  options: ConversionOptions;
  status: 'idle' | 'loading' | 'converting' | 'done' | 'error';
  progress: number;
  error: string | null;
  inputUrl: string | null;
  outputUrl: string | null;
}

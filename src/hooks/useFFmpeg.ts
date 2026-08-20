import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useEffect, useRef, useState } from 'react';

import {
  ALLOWED_CDN_PREFIX,
  FFMPEG_CORE_URL,
  FFMPEG_WASM_URL,
} from '../utils/constants';
import { getFileExtension } from '../utils/formats';

type FFmpegStatus = 'idle' | 'loading' | 'converting' | 'error';

export interface UseFFmpegResult {
  loaded: boolean;
  loading: boolean;
  converting: boolean;
  progress: number;
  error: string | null;
  load: () => Promise<void>;
  convert: (
    inputFile: File,
    outputName: string,
    args: string[],
  ) => Promise<Uint8Array>;
  resetError: () => void;
}

export function useFFmpeg(): UseFFmpegResult {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadErrorRef = useRef<string | null>(null);
  const [status, setStatus] = useState<FFmpegStatus>('idle');
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function resetError() {
    setError(null);
    loadErrorRef.current = null;
  }

  async function load() {
    if (ffmpegRef.current?.loaded) {
      return;
    }

    setStatus('loading');
    setError(null);
    setProgress(0);

    try {
      /* v8 ignore start */
      if (
        !FFMPEG_CORE_URL.startsWith(ALLOWED_CDN_PREFIX) ||
        !FFMPEG_WASM_URL.startsWith(ALLOWED_CDN_PREFIX)
      ) {
        throw new Error('Invalid FFmpeg CDN URL');
      }
      /* v8 ignore stop */

      const ffmpeg = new FFmpeg();
      ffmpeg.on('progress', ({ progress: value }) => {
        setProgress(value);
      });

      await ffmpeg.load({
        coreURL: FFMPEG_CORE_URL,
        wasmURL: FFMPEG_WASM_URL,
      });

      ffmpegRef.current = ffmpeg;
      loadErrorRef.current = null;
      setLoaded(true);
      setStatus('idle');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('FFmpeg load failed:', err);
      /* v8 ignore start */
      const message =
        err instanceof Error
          ? err.message
          : `Failed to load FFmpeg from CDN: ${String(err)}`;
      /* v8 ignore stop */
      setLoaded(false);
      setStatus('error');
      setError(message);
      loadErrorRef.current = message;
    } finally {
      setProgress(0);
    }
  }

  async function convert(
    inputFile: File,
    outputName: string,
    args: string[],
  ): Promise<Uint8Array> {
    if (!ffmpegRef.current?.loaded) {
      await load();
    }

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg?.loaded) {
      const message = loadErrorRef.current ?? 'FFmpeg is not loaded';
      setStatus('error');
      setError(message);
      throw new Error(message);
    }

    setStatus('converting');
    setError(null);

    const extension = getFileExtension(inputFile.name) || 'bin';
    const inputName = `input.${extension}`;

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
      const exitCode = await ffmpeg.exec([...args, outputName]);

      if (exitCode !== 0) {
        throw new Error(`FFmpeg exited with code ${String(exitCode)}`);
      }

      const data = await ffmpeg.readFile(outputName);

      if (!(data instanceof Uint8Array)) {
        throw new Error('Unexpected output data format');
      }

      setStatus('idle');
      return data;
    } catch (err) {
      setStatus('error');
      /* v8 ignore start */
      const message = err instanceof Error ? err.message : 'Conversion failed';
      /* v8 ignore stop */
      setError(message);
      throw new Error(message, { cause: err });
    }
  }

  useEffect(() => {
    return () => {
      ffmpegRef.current?.terminate();
      ffmpegRef.current = null;
    };
  }, []);

  return {
    loaded,
    loading: status === 'loading',
    converting: status === 'converting',
    progress,
    error,
    load,
    convert,
    resetError,
  };
}

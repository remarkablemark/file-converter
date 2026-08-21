import { useEffect, useState } from 'react';

import type { ConversionOptions } from '../types/converter';
import type { Category } from '../utils/constants';
import {
  getCategory,
  getDefaultOutputFormat,
  getMimeType,
} from '../utils/formats';
import {
  buildFFmpegArgs,
  changeExtension,
  createFileUrl,
  getDefaultOptions,
  getInputName,
  getMediaDimensions,
  getOutputFilename,
  isLargeFile,
  revokeFileUrl,
  sanitizeFilename,
} from '../utils/helpers';
import { useFFmpeg } from './useFFmpeg';

export type ConverterStatus =
  'idle' | 'loading' | 'converting' | 'done' | 'error';

export interface UseConverterResult {
  file: File | null;
  category: Category | null;
  outputFormat: string;
  outputFilename: string;
  options: ConversionOptions;
  status: ConverterStatus;
  progress: number;
  error: string | null;
  inputUrl: string | null;
  outputUrl: string | null;
  isLargeFile: boolean;
  setFile: (file: File | null) => void;
  setOutputFormat: (format: string) => void;
  setOutputFilename: (filename: string) => void;
  updateOptions: <T extends Category>(
    category: T,
    patch: Partial<ConversionOptions[T]>,
  ) => void;
  convert: () => Promise<void>;
  cancel: () => void;
  download: () => void;
}

export function useConverter(): UseConverterResult {
  const ffmpeg = useFFmpeg();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [outputFormat, setOutputFormat] = useState('');
  const [outputFilename, setOutputFilename] = useState('output.bin');
  const [options, setOptions] = useState(() => getDefaultOptions());
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ConverterStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !selectedFile ||
      !category ||
      (category !== 'image' && category !== 'video')
    ) {
      return;
    }

    const file = selectedFile;
    const categoryKey = category;
    let active = true;

    async function loadDimensions() {
      const dimensions = await getMediaDimensions(file);
      /* v8 ignore next 3 */
      if (!active || !dimensions) {
        return;
      }

      setOptions((previous) => ({
        ...previous,
        [categoryKey]: {
          ...previous[categoryKey],
          height: dimensions.height,
          width: dimensions.width,
        },
      }));
    }

    void loadDimensions();

    return () => {
      active = false;
    };
  }, [category, selectedFile]);

  function clearErrors() {
    setError(null);
    ffmpeg.resetError();
  }

  function setFile(newFile: File | null) {
    clearErrors();

    if (inputUrl) {
      revokeFileUrl(inputUrl);
    }

    setInputUrl(null);

    setOutputUrl((previousUrl) => {
      if (previousUrl) {
        revokeFileUrl(previousUrl);
      }
      return null;
    });

    if (!newFile) {
      setSelectedFile(null);
      setCategory(null);
      setOutputFormat('');
      setOutputFilename('output.bin');
      setOptions(getDefaultOptions());
      setStatus('idle');
      return;
    }

    setSelectedFile(newFile);
    const detectedCategory = getCategory(newFile);
    setCategory(detectedCategory);

    if (!detectedCategory) {
      setError(
        'Unsupported file type. Please choose an image, video, or audio file.',
      );
      setStatus('error');
      setOutputFormat('');
      setOutputFilename(getOutputFilename(newFile.name, 'bin'));
      setOptions(getDefaultOptions());
      setInputUrl(createFileUrl(newFile));
      return;
    }

    const format = getDefaultOutputFormat(detectedCategory);
    setOutputFormat(format);
    setOutputFilename(getOutputFilename(newFile.name, format));
    setOptions(getDefaultOptions());
    setStatus('idle');
    setInputUrl(createFileUrl(newFile));
  }

  function updateOutputFormat(format: string) {
    setOutputFormat(format);
    setOutputFilename((previous) => changeExtension(previous, format));
  }

  function updateOutputFilename(filename: string) {
    setOutputFilename(filename);
  }

  function updateOptions<T extends Category>(
    optionCategory: T,
    patch: Partial<ConversionOptions[T]>,
  ) {
    setOptions((previous) => ({
      ...previous,
      [optionCategory]: { ...previous[optionCategory], ...patch },
    }));
  }

  function cancel() {
    ffmpeg.cancel();
  }

  async function convert() {
    if (!selectedFile || !category || !outputFormat) {
      setError('Please select a file and output format');
      setStatus('error');
      return;
    }

    setError(null);
    ffmpeg.resetError();

    setOutputUrl((previousUrl) => {
      if (previousUrl) {
        revokeFileUrl(previousUrl);
      }
      return null;
    });

    try {
      if (!ffmpeg.loaded) {
        setStatus('loading');
      }
      await ffmpeg.load();
      setStatus('converting');

      const inputName = getInputName(selectedFile);
      const outputName =
        sanitizeFilename(outputFilename) || `output.${outputFormat}`;
      const args = buildFFmpegArgs(inputName, outputFormat, category, options);
      const data = await ffmpeg.convert(selectedFile, outputName, args);

      const blob = new Blob([data as BlobPart], {
        type: getMimeType(outputFormat),
      });
      setOutputUrl(createFileUrl(blob));
      setStatus('done');
    } catch (err) {
      if (err instanceof Error && err.message === 'Conversion cancelled') {
        setStatus('idle');
        setError(null);
        return;
      }

      setStatus('error');
      /* v8 ignore start */
      setError(err instanceof Error ? err.message : 'Conversion failed');
      /* v8 ignore stop */
    }
  }

  function download() {
    if (!outputUrl) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = outputUrl;
    anchor.download =
      sanitizeFilename(outputFilename) || `output.${outputFormat}`;
    anchor.click();
  }

  return {
    file: selectedFile,
    category,
    outputFormat,
    outputFilename,
    options,
    status,
    progress: ffmpeg.progress,
    error: error ?? ffmpeg.error,
    inputUrl,
    outputUrl,
    isLargeFile: selectedFile ? isLargeFile(selectedFile) : false,
    setFile,
    setOutputFormat: updateOutputFormat,
    setOutputFilename: updateOutputFilename,
    updateOptions,
    convert,
    cancel,
    download,
  };
}

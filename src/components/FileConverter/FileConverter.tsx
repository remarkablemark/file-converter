import { useState } from 'react';

import { useConverter } from '../../hooks/useConverter';
import { ConversionProgress } from '../ConversionProgress';
import { FileDropzone } from '../FileDropzone';
import { FormatSelector } from '../FormatSelector';
import { OptionsPanel } from '../OptionsPanel';

export function FileConverter() {
  const converter = useConverter();
  const [downloaded, setDownloaded] = useState(false);

  const isBusy =
    converter.status === 'loading' || converter.status === 'converting';

  function handleDownload() {
    converter.download();
    setDownloaded(true);
    window.setTimeout(() => {
      setDownloaded(false);
    }, 2000);
  }

  function renderPreview(url: string | null, label: string) {
    /* v8 ignore next 3 */
    if (!url) {
      return null;
    }

    /* v8 ignore next 3 */
    if (!converter.category) {
      return null;
    }

    if (converter.category === 'image') {
      return (
        <img
          alt={label}
          className="max-h-64 rounded-md object-contain"
          src={url}
        />
      );
    }

    if (converter.category === 'video') {
      return (
        <video
          className="max-h-64 w-full rounded-md"
          controls
          preload="metadata"
          src={url}
        />
      );
    }

    return <audio className="w-full" controls preload="metadata" src={url} />;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">File Converter</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Convert images, audio, and video in your browser with FFmpeg.
          </p>
        </header>

        <FileDropzone disabled={isBusy} onFileSelect={converter.setFile} />

        {converter.file && (
          <div className="rounded-md bg-white p-4 shadow-xs dark:bg-slate-800">
            <p className="font-medium">{converter.file.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {(converter.file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            {converter.isLargeFile && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                Large file: conversion may be slow or fail.
              </p>
            )}
          </div>
        )}

        <ConversionProgress
          error={converter.error}
          progress={converter.progress}
          status={converter.status}
        />

        {converter.category && (
          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 rounded-lg bg-white p-6 shadow-xs dark:bg-slate-800">
              <h2 className="text-xl font-semibold">Output settings</h2>

              <FormatSelector
                category={converter.category}
                disabled={isBusy}
                onChange={converter.setOutputFormat}
                value={converter.outputFormat}
              />

              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Output filename
                <input
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  disabled={isBusy}
                  onChange={(event) => {
                    converter.setOutputFilename(event.target.value);
                  }}
                  type="text"
                  value={converter.outputFilename}
                />
              </label>

              <div>
                <h3 className="mb-4 text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  Options
                </h3>
                <OptionsPanel
                  category={converter.category}
                  disabled={isBusy}
                  onChange={converter.updateOptions}
                  options={converter.options}
                  outputFormat={converter.outputFormat}
                />
              </div>

              <button
                className={
                  isBusy
                    ? 'w-full cursor-pointer rounded-md bg-red-600 px-4 py-2 font-medium text-white shadow-xs transition-colors hover:bg-red-500 focus:ring-2 focus:ring-red-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
                    : 'w-full cursor-pointer rounded-md bg-slate-800 px-4 py-2 font-medium text-white shadow-xs transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100'
                }
                disabled={
                  (isBusy && converter.status === 'loading') ||
                  (!isBusy && !converter.outputFormat)
                }
                onClick={() => {
                  if (isBusy) {
                    converter.cancel();
                  } else {
                    void converter.convert();
                  }
                }}
                type="button"
              >
                {isBusy ? 'Cancel' : 'Convert'}
              </button>
            </div>

            <div className="space-y-6 rounded-lg bg-white p-6 shadow-xs dark:bg-slate-800">
              <h2 className="text-xl font-semibold">Preview</h2>

              {converter.inputUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Original
                  </p>
                  {renderPreview(converter.inputUrl, 'Original preview')}
                </div>
              )}

              {converter.outputUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Converted
                  </p>
                  {renderPreview(converter.outputUrl, 'Converted preview')}
                </div>
              )}

              {converter.status === 'done' && converter.outputUrl && (
                <button
                  className="w-full cursor-pointer rounded-md bg-green-700 px-4 py-2 font-medium text-white shadow-xs transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-hidden"
                  onClick={handleDownload}
                  type="button"
                >
                  {downloaded ? 'Downloaded ✓' : 'Download'}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

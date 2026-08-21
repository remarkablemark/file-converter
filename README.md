# File Converter

[![build](https://github.com/remarkablemark/file-converter/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablemark/file-converter/actions/workflows/build.yml)
[![test](https://github.com/remarkablemark/file-converter/actions/workflows/test.yml/badge.svg)](https://github.com/remarkablemark/file-converter/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/remarkablemark/file-converter/graph/badge.svg?token=u7WVFjdSD3)](https://codecov.io/gh/remarkablemark/file-converter)

📁 File converter that converts media and image files in the browser using FFmpeg WebAssembly. All processing happens client-side — no files are uploaded to a server.

- [File Converter](https://remarkablemark.org/file-converter/)

## Features

- **Browser-based conversion** — powered by [FFmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm); no server or upload required
- **Drag-and-drop** — drop files directly or click to browse; visual feedback on hover and drag-over
- **Auto-detection** — detects file category (image, video, audio) from MIME type and extension
- **Format selection** — shows only compatible output formats for the detected category
- **Advanced options** — category-aware controls:
  - **Image**: dimensions, fit mode (contain, cover, stretch, force), quality, transparency preservation, background color
  - **Video**: dimensions, fit mode, frame rate, CRF quality, audio preservation with bitrate, GIF loop toggle
  - **Audio**: bitrate, sample rate, channels (mono/stereo)
- **Progress indicator** — real-time progress bar during FFmpeg transcoding
- **Cancel** — abort in-progress conversions
- **Preview** — native `<img>`, `<video>`, or `<audio>` preview of the input file
- **Large file warning** — alerts when a file exceeds 100 MB
- **Editable filename** — output filename is pre-filled and sanitized
- **Dark mode** — full dark mode support
- **Responsive** — mobile-first layout that adapts to desktop

## Supported Formats

| Category | Inputs                              | Outputs                        |
| -------- | ----------------------------------- | ------------------------------ |
| Image    | PNG, JPEG, WebP, GIF, BMP, ICO, SVG | PNG, JPEG, WebP, GIF, BMP, ICO |
| Video    | MP4, WebM, MOV, AVI, MKV, GIF       | MP4, WebM, MOV, AVI, MKV, GIF  |
| Audio    | MP3, WAV, OGG, AAC, FLAC, M4A       | MP3, WAV, OGG, AAC, FLAC, M4A  |

> SVG inputs are rasterized to the chosen bitmap format.

## Install

Clone the repository:

```sh
git clone https://github.com/remarkablemark/file-converter.git
cd file-converter
```

Install the dependencies:

```sh
npm install
```

## Environment Variables

Update the environment variables:

```sh
cp .env.example .env
```

Update the **Secrets** in the repository **Settings**.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) to view it in the browser.

The page will reload if you make edits.

You will also see any errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.

It correctly bundles in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

### `npm run lint`

Checks the code quality.

### `npm run lint:tsc`

Checks for type errors.

### `npm test`

Runs the tests.

## License

[MIT](LICENSE)

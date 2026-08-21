import {
  buildFFmpegArgs,
  buildFlattenFilterComplex,
  buildScaleFilter,
  changeExtension,
  createFileUrl,
  getBaseName,
  getDefaultOptions,
  getInputName,
  getMediaDimensions,
  getOutputFilename,
  isLargeFile,
  isValidOutputFormat,
  mapImageQuality,
  revokeFileUrl,
  sanitizeFilename,
  toFfmpegColor,
} from './helpers';

describe('helpers', () => {
  describe('sanitizeFilename', () => {
    it('replaces unsafe characters with underscores', () => {
      expect(sanitizeFilename('hello/world@.mp4')).toBe('hello_world_.mp4');
    });

    it('keeps allowed characters', () => {
      expect(sanitizeFilename('my-file_v2.0.png')).toBe('my-file_v2.0.png');
    });
  });

  describe('getBaseName', () => {
    it('strips extension', () => {
      expect(getBaseName('video.mp4')).toBe('video');
    });

    it('returns full name when there is no extension', () => {
      expect(getBaseName('Makefile')).toBe('Makefile');
    });
  });

  describe('getOutputFilename', () => {
    it('replaces extension and sanitizes', () => {
      expect(getOutputFilename('my video!.avi', 'mp4')).toBe('my_video_.mp4');
    });
  });

  describe('changeExtension', () => {
    it('replaces the extension', () => {
      expect(changeExtension('output.mp4', 'webm')).toBe('output.webm');
    });
  });

  describe('toFfmpegColor', () => {
    it('converts hex to ffmpeg 0x format', () => {
      expect(toFfmpegColor('#ff0000')).toBe('0xff0000');
    });

    it('returns named colors unchanged', () => {
      expect(toFfmpegColor('red')).toBe('red');
    });
  });

  describe('createFileUrl and revokeFileUrl', () => {
    it('creates and revokes object URLs', () => {
      const revokeObjectURL = vi.fn();
      globalThis.URL.revokeObjectURL = revokeObjectURL;

      const file = new File([], 'test');
      const url = createFileUrl(file);
      expect(url).toBe('blob://test');

      revokeFileUrl(url);
      expect(revokeObjectURL).toHaveBeenCalledWith(url);
    });

    it('revokeFileUrl does nothing for null', () => {
      const revokeObjectURL = vi.fn();
      globalThis.URL.revokeObjectURL = revokeObjectURL;

      revokeFileUrl(null);
      expect(revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('isLargeFile', () => {
    it('detects files over the threshold', () => {
      expect(
        isLargeFile(new File([new ArrayBuffer(100 * 1024 * 1024 + 1)], 'x')),
      ).toBe(true);
      expect(isLargeFile(new File([new ArrayBuffer(1024)], 'x'))).toBe(false);
    });
  });

  describe('buildScaleFilter', () => {
    it('returns null when no dimensions are provided', () => {
      expect(buildScaleFilter(undefined, undefined, 'contain')).toBeNull();
    });

    it('scales with -1 when one dimension is missing', () => {
      expect(buildScaleFilter(100, undefined, 'contain')).toBe('scale=100:-1');
      expect(buildScaleFilter(undefined, 100, 'contain')).toBe('scale=-1:100');
    });

    it('builds contain filter with padding', () => {
      expect(buildScaleFilter(100, 100, 'contain', '#ffffff')).toBe(
        'scale=100:100:force_original_aspect_ratio=decrease,pad=100:100:(ow-iw)/2:(oh-ih)/2:0xffffff',
      );
    });

    it('builds cover filter with crop', () => {
      expect(buildScaleFilter(100, 100, 'cover')).toBe(
        'scale=100:100:force_original_aspect_ratio=increase,crop=100:100',
      );
    });

    it('builds stretch filter', () => {
      expect(buildScaleFilter(100, 100, 'stretch')).toBe('scale=100:100');
    });

    it('builds force filter', () => {
      expect(buildScaleFilter(100, 100, 'force')).toBe('scale=100:100');
    });
  });

  describe('mapImageQuality', () => {
    it('maps 0 to 31 and 100 to 1', () => {
      expect(mapImageQuality(0)).toBe(31);
      expect(mapImageQuality(100)).toBe(1);
    });
  });

  describe('buildFFmpegArgs', () => {
    const baseOptions = getDefaultOptions();

    it('builds audio args', () => {
      const options = {
        ...baseOptions,
        audio: {
          bitrate: '128k',
          sampleRate: 44100,
          channels: 'mono' as const,
        },
      };
      const args = buildFFmpegArgs('input.wav', 'flac', 'audio', options);
      expect(args).toEqual([
        '-i',
        'input.wav',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '1',
        '-compression_level',
        '5',
      ]);
    });

    it('builds image args', () => {
      const options = {
        ...baseOptions,
        image: {
          ...baseOptions.image,
          width: 100,
          height: 100,
          quality: 80,
        },
      };
      const args = buildFFmpegArgs('input.png', 'jpg', 'image', options);
      expect(args).toContain('-i');
      expect(args).toContain('input.png');
      expect(args).toContain('-vf');
      expect(args).toContain('-q:v');
    });

    it('builds video args with audio preserved', () => {
      const options = {
        ...baseOptions,
        video: {
          ...baseOptions.video,
          width: 1280,
          height: 720,
          fps: 30,
          preserveAudio: true,
          audioBitrate: '192k',
        },
      };
      const args = buildFFmpegArgs('input.avi', 'mp4', 'video', options);
      expect(args).toContain('-r');
      expect(args).toContain('30');
      expect(args).toContain('-crf');
      expect(args).toContain('-b:a');
      expect(args).toContain('192k');
    });

    it('builds video args without audio', () => {
      const options = {
        ...baseOptions,
        video: { ...baseOptions.video, preserveAudio: false },
      };
      const args = buildFFmpegArgs('input.mp4', 'mp4', 'video', options);
      expect(args).toContain('-an');
    });

    it('builds looping gif args', () => {
      const options = {
        ...baseOptions,
        video: { ...baseOptions.video, loop: true },
      };
      const args = buildFFmpegArgs('input.mp4', 'gif', 'video', options);
      expect(args).toContain('-loop');
      expect(args).toContain('0');
    });

    it('uses VP8 with performance flags for webm', () => {
      const args = buildFFmpegArgs('input.mp4', 'webm', 'video', baseOptions);
      expect(args).toEqual([
        '-i',
        'input.mp4',
        '-c:v',
        'libvpx',
        '-deadline',
        'good',
        '-cpu-used',
        '5',
        '-crf',
        String(baseOptions.video.quality),
      ]);
    });
  });

  describe('getInputName', () => {
    it('returns input with extension', () => {
      expect(
        getInputName(new File([], 'video.mp4', { type: 'video/mp4' })),
      ).toBe('input.mp4');
    });

    it('falls back to bin extension', () => {
      expect(getInputName(new File([], 'video', { type: '' }))).toBe(
        'input.bin',
      );
    });
  });

  describe('isValidOutputFormat', () => {
    it('returns true for matching category and format', () => {
      expect(isValidOutputFormat('video', 'mp4')).toBe(true);
    });

    it('returns false for non-matching category and format', () => {
      expect(isValidOutputFormat('audio', 'png')).toBe(false);
    });

    it('returns false for unknown format', () => {
      expect(isValidOutputFormat('video', 'xyz')).toBe(false);
    });
  });

  describe('changeExtension', () => {
    it('replaces the file extension', () => {
      expect(changeExtension('video.mp4', 'webm')).toBe('video.webm');
    });

    it('falls back to output when base name is empty', () => {
      expect(changeExtension('', 'mp4')).toBe('output.mp4');
    });
  });

  describe('getOutputFilename', () => {
    it('falls back to output when base name is empty', () => {
      expect(getOutputFilename('', 'webm')).toBe('output.webm');
    });
  });

  describe('buildAudioArgs', () => {
    it('omits optional audio settings when not provided', () => {
      const defaults = getDefaultOptions();
      const options = { ...defaults, audio: { channels: 'stereo' as const } };
      const args = buildFFmpegArgs('input.wav', 'mp3', 'audio', options);
      expect(args).toEqual(['-i', 'input.wav', '-ac', '2']);
    });
  });

  describe('buildFlattenFilterComplex', () => {
    it('builds a centered overlay for contain fit', () => {
      expect(buildFlattenFilterComplex(100, 100, 'contain', '#ffffff')).toBe(
        'color=c=0xffffff:s=100x100[bg];[0:v]scale=100:100:force_original_aspect_ratio=decrease[img];[bg][img]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:format=auto[outv]',
      );
    });

    it('builds a top-left overlay for cover fit', () => {
      expect(buildFlattenFilterComplex(100, 100, 'cover', '#ffffff')).toBe(
        'color=c=0xffffff:s=100x100[bg];[0:v]scale=100:100:force_original_aspect_ratio=increase,crop=100:100[img];[bg][img]overlay=0:0:format=auto[outv]',
      );
    });

    it('builds a top-left overlay for stretch and force fits', () => {
      expect(buildFlattenFilterComplex(100, 100, 'stretch', '#ffffff')).toBe(
        'color=c=0xffffff:s=100x100[bg];[0:v]scale=100:100[img];[bg][img]overlay=0:0:format=auto[outv]',
      );
      expect(buildFlattenFilterComplex(100, 100, 'force', '#ffffff')).toBe(
        'color=c=0xffffff:s=100x100[bg];[0:v]scale=100:100[img];[bg][img]overlay=0:0:format=auto[outv]',
      );
    });
  });

  describe('buildImageArgs', () => {
    it('skips filter and quality for png without dimensions', () => {
      const defaults = getDefaultOptions();
      const options = {
        ...defaults,
        image: { ...defaults.image, width: undefined, height: undefined },
      };
      const args = buildFFmpegArgs('input.png', 'png', 'image', options);
      expect(args).toEqual(['-i', 'input.png']);
    });

    it('uses filter_complex to flatten transparency onto the background color', () => {
      const defaults = getDefaultOptions();
      const options = {
        ...defaults,
        image: {
          ...defaults.image,
          width: 100,
          height: 100,
          fit: 'contain' as const,
          background: '#ffffff',
          preserveTransparency: false,
        },
      };
      const args = buildFFmpegArgs('input.jpg', 'jpg', 'image', options);

      expect(args).toEqual([
        '-i',
        'input.jpg',
        '-filter_complex',
        'color=c=0xffffff:s=100x100[bg];[0:v]scale=100:100:force_original_aspect_ratio=decrease[img];[bg][img]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2:format=auto[outv]',
        '-map',
        '[outv]',
        '-update',
        '1',
        '-frames:v',
        '1',
        '-q:v',
        String(mapImageQuality(80)),
      ]);
    });

    it('falls back to -vf when preserving transparency', () => {
      const defaults = getDefaultOptions();
      const options = {
        ...defaults,
        image: {
          ...defaults.image,
          width: 100,
          height: 100,
          fit: 'contain' as const,
          preserveTransparency: true,
        },
      };
      const args = buildFFmpegArgs('input.png', 'png', 'image', options);

      expect(args).not.toContain('-filter_complex');
      expect(args).toContain('-vf');
    });

    it('falls back to -vf when dimensions are missing even without preserving transparency', () => {
      const defaults = getDefaultOptions();
      const options = {
        ...defaults,
        image: {
          ...defaults.image,
          width: undefined,
          height: 100,
          preserveTransparency: false,
        },
      };
      const args = buildFFmpegArgs('input.jpg', 'jpg', 'image', options);

      expect(args).not.toContain('-filter_complex');
    });
  });

  describe('buildVideoArgs', () => {
    it('does not loop when looping is disabled for gif', () => {
      const defaults = getDefaultOptions();
      const options = {
        ...defaults,
        video: { ...defaults.video, loop: false },
      };
      const args = buildFFmpegArgs('input.mp4', 'gif', 'video', options);
      expect(args).not.toContain('-loop');
    });
  });

  describe('getMediaDimensions', () => {
    it('returns null for non-image/video files', async () => {
      const file = new File([], 'song.mp3', { type: 'audio/mpeg' });
      await expect(getMediaDimensions(file)).resolves.toBeNull();
    });

    it('returns image dimensions when the image loads', async () => {
      let imageElement: HTMLImageElement | undefined;
      vi.spyOn(window, 'Image').mockImplementation(function mockImage() {
        const element = document.createElement('img');
        Object.defineProperty(element, 'naturalWidth', { value: 100 });
        Object.defineProperty(element, 'naturalHeight', { value: 200 });
        imageElement = element;
        return element;
      });

      const file = new File([], 'image.png', { type: 'image/png' });
      const promise = getMediaDimensions(file);
      imageElement?.dispatchEvent(new Event('load'));
      await expect(promise).resolves.toEqual({ height: 200, width: 100 });
    });
  });
});

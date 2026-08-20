import {
  getCategory,
  getDefaultOutputFormat,
  getFileExtension,
  getMimeType,
  getOutputFormat,
  getOutputFormats,
  OUTPUT_FORMATS,
} from './formats';

describe('formats utilities', () => {
  describe('getFileExtension', () => {
    it('returns lowercase extension', () => {
      expect(getFileExtension('My.Video.MP4')).toBe('mp4');
    });

    it('returns empty string when there is no extension', () => {
      expect(getFileExtension('Makefile')).toBe('');
    });
  });

  describe('getCategory', () => {
    it('detects image from MIME type', () => {
      const file = new File([], 'x', { type: 'image/png' });
      expect(getCategory(file)).toBe('image');
    });

    it('detects video from MIME type', () => {
      const file = new File([], 'x', { type: 'video/mp4' });
      expect(getCategory(file)).toBe('video');
    });

    it('detects audio from MIME type', () => {
      const file = new File([], 'x', { type: 'audio/mpeg' });
      expect(getCategory(file)).toBe('audio');
    });

    it('falls back to extension detection', () => {
      expect(getCategory(new File([], 'song.mp3', { type: '' }))).toBe('audio');
      expect(getCategory(new File([], 'clip.avi', { type: '' }))).toBe('video');
      expect(getCategory(new File([], 'pic.bmp', { type: '' }))).toBe('image');
    });

    it('returns null for unsupported files', () => {
      expect(getCategory(new File([], 'data.csv', { type: '' }))).toBeNull();
    });
  });

  describe('getOutputFormats', () => {
    it('returns formats for a category', () => {
      const videoFormats = getOutputFormats('video');
      expect(videoFormats.every((format) => format.category === 'video')).toBe(
        true,
      );
      expect(videoFormats.map((format) => format.value)).toContain('mp4');
    });
  });

  describe('getOutputFormat', () => {
    it('finds a known format', () => {
      expect(getOutputFormat('png')).toEqual(
        OUTPUT_FORMATS.find((format) => format.value === 'png'),
      );
    });

    it('returns undefined for unknown format', () => {
      expect(getOutputFormat('xyz')).toBeUndefined();
    });
  });

  describe('getDefaultOutputFormat', () => {
    it('returns png for image, mp4 for video, mp3 for audio', () => {
      expect(getDefaultOutputFormat('image')).toBe('png');
      expect(getDefaultOutputFormat('video')).toBe('mp4');
      expect(getDefaultOutputFormat('audio')).toBe('mp3');
    });
  });

  describe('getMimeType', () => {
    it('returns the MIME type for a known extension', () => {
      expect(getMimeType('mp4')).toBe('video/mp4');
      expect(getMimeType('jpg')).toBe('image/jpeg');
    });

    it('falls back to octet-stream for unknown extension', () => {
      expect(getMimeType('xyz')).toBe('application/octet-stream');
    });
  });
});

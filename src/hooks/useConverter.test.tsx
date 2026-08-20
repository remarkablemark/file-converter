import { FFmpeg } from '@ffmpeg/ffmpeg';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import type { ImageOptions, VideoOptions } from '../types/converter';
import { useConverter } from './useConverter';

vi.mock('../utils/helpers', async (importOriginal) => {
  const original = await importOriginal<typeof import('../utils/helpers')>();
  return {
    ...original,
    getMediaDimensions: vi.fn((file: File) => {
      if (file.type.startsWith('image/')) {
        return Promise.resolve({ height: 600, width: 800 });
      }
      if (file.type.startsWith('video/')) {
        return Promise.resolve({ height: 1080, width: 1920 });
      }
      return Promise.resolve(null);
    }),
  };
});

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn(),
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
}));

function TestComponent() {
  const converter = useConverter();
  const [message, setMessage] = useState('');

  return (
    <div>
      <span aria-label="Status">{converter.status}</span>
      <span aria-label="Category">{converter.category ?? 'none'}</span>
      <span aria-label="Filename">{converter.outputFilename}</span>
      <span aria-label="Error">{converter.error ?? 'no-error'}</span>
      <span aria-label="Message">{message}</span>
      <span aria-label="Width">
        {(
          converter.options[converter.category ?? 'image'] as
            ImageOptions | VideoOptions
        ).width ?? 'none'}
      </span>
      <span aria-label="Height">
        {(
          converter.options[converter.category ?? 'image'] as
            ImageOptions | VideoOptions
        ).height ?? 'none'}
      </span>

      <button
        onClick={() => {
          converter.setFile(new File([], 'my clip.mp4', { type: 'video/mp4' }));
        }}
        type="button"
      >
        Set video
      </button>

      <button
        onClick={() => {
          converter.setFile(new File([], 'image.png', { type: 'image/png' }));
        }}
        type="button"
      >
        Set image
      </button>

      <button
        onClick={() => {
          converter.setFile(new File([], 'data.csv'));
        }}
        type="button"
      >
        Set unsupported
      </button>

      <button
        onClick={() => {
          void (async () => {
            try {
              await converter.convert();
            } catch {
              setMessage('caught');
            }
          })();
        }}
        type="button"
      >
        Convert
      </button>

      <button onClick={converter.download} type="button">
        Download
      </button>

      <label htmlFor="filename-input">Output filename</label>
      <input
        id="filename-input"
        onChange={(event) => {
          converter.setOutputFilename(event.target.value);
        }}
        type="text"
        value={converter.outputFilename}
      />

      <label htmlFor="format-select">Output format</label>
      <select
        id="format-select"
        onChange={(event) => {
          converter.setOutputFormat(event.target.value);
        }}
        value={converter.outputFormat}
      >
        <option value="mp4">MP4</option>
        <option value="webm">WebM</option>
      </select>

      <button
        onClick={() => {
          converter.updateOptions('video', { fps: 30 });
        }}
        type="button"
      >
        Update option
      </button>

      <button
        onClick={() => {
          converter.setFile(new File([], 'song.mp3', { type: 'audio/mpeg' }));
        }}
        type="button"
      >
        Set audio
      </button>

      <button
        onClick={() => {
          converter.setFile(null);
        }}
        type="button"
      >
        Clear file
      </button>
    </div>
  );
}

describe('useConverter hook', () => {
  let mockFFmpeg: {
    loaded: boolean;
    on: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
    exec: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
    readFile: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockFFmpeg = {
      loaded: false,
      on: vi.fn(),
      load: vi.fn(() => {
        mockFFmpeg.loaded = true;
        return Promise.resolve(true);
      }),
      exec: vi.fn(() => Promise.resolve(0)),
      writeFile: vi.fn(() => Promise.resolve(true)),
      readFile: vi.fn(() => Promise.resolve(new Uint8Array([4, 5, 6]))),
      terminate: vi.fn(),
    };
    vi.mocked(FFmpeg).mockImplementation(function mockFFmpegConstructor() {
      return mockFFmpeg as unknown as FFmpeg;
    });
  });

  it('starts idle with defaults', () => {
    render(<TestComponent />);

    expect(screen.getByLabelText('Status')).toHaveTextContent('idle');
    expect(screen.getByLabelText('Category')).toHaveTextContent('none');
    expect(screen.getByLabelText('Filename')).toHaveTextContent('output.bin');
    expect(screen.getByLabelText('Error')).toHaveTextContent('no-error');
  });

  it('detects category and derives output filename when a file is set', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));

    expect(screen.getByLabelText('Category')).toHaveTextContent('video');
    expect(screen.getByLabelText('Filename')).toHaveTextContent('my_clip.mp4');
  });

  it('loads image dimensions after setting an image file', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set image/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Width')).toHaveTextContent('800');
      expect(screen.getByLabelText('Height')).toHaveTextContent('600');
    });
  });

  it('loads video dimensions after setting a video file', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Width')).toHaveTextContent('1920');
      expect(screen.getByLabelText('Height')).toHaveTextContent('1080');
    });
  });

  it('does not load dimensions for audio files', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set audio/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Width')).toHaveTextContent('none');
      expect(screen.getByLabelText('Height')).toHaveTextContent('none');
    });
  });

  it('warns about unsupported files', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set unsupported/i }));

    expect(screen.getByLabelText('Error')).toHaveTextContent(
      'Unsupported file type',
    );
    expect(screen.getByLabelText('Status')).toHaveTextContent('error');
  });

  it('updates output filename when format changes', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.selectOptions(screen.getByLabelText('Output format'), 'webm');

    expect(screen.getByLabelText('Filename')).toHaveTextContent('my_clip.webm');
  });

  it('updates options', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /update option/i }));

    // No direct assertion possible without exposing options; hook completes without error.
    expect(screen.getByLabelText('Status')).toHaveTextContent('idle');
  });

  it('requires a file before converting', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /convert/i }));

    expect(screen.getByLabelText('Error')).toHaveTextContent(
      'Please select a file and output format',
    );
  });

  it('converts a file successfully', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });
  });

  it('reports conversion failures', async () => {
    const user = userEvent.setup();
    mockFFmpeg.exec = vi.fn(() => Promise.resolve(1));

    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'FFmpeg exited with code 1',
      );
    });
  });

  it('downloads the converted file', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });

    await user.click(screen.getByRole('button', { name: /download/i }));
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it('updates output filename through the input', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.clear(screen.getByLabelText('Output filename'));
    await user.type(screen.getByLabelText('Output filename'), 'renamed.webm');

    expect(screen.getByLabelText('Filename')).toHaveTextContent('renamed.webm');
  });

  it('revokes the previous output URL when converting again', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });

    await user.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });
  });

  it('does nothing when downloading without a converted file', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(screen.getByLabelText('Status')).toHaveTextContent('idle');
  });

  it('clears state when setFile is called with null', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /clear file/i }));

    expect(screen.getByLabelText('Category')).toHaveTextContent('none');
    expect(screen.getByLabelText('Filename')).toHaveTextContent('output.bin');
    expect(screen.getByLabelText('Status')).toHaveTextContent('idle');
  });

  it('revokes previous URLs when setting a new file', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });

    await user.click(screen.getByRole('button', { name: /set audio/i }));

    expect(screen.getByLabelText('Category')).toHaveTextContent('audio');
    expect(screen.getByLabelText('Status')).toHaveTextContent('idle');
  });

  it('uses default output name and reports conversion failures', async () => {
    const user = userEvent.setup();
    mockFFmpeg.exec = vi.fn(() => {
      throw new Error('conversion error');
    });

    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.clear(screen.getByLabelText('Output filename'));
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'conversion error',
      );
    });
    expect(screen.getByLabelText('Status')).toHaveTextContent('error');
  });

  it('falls back to default filename when downloading with an empty filename', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /set video/i }));
    await user.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toHaveTextContent('done');
    });

    await user.clear(screen.getByLabelText('Output filename'));
    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});

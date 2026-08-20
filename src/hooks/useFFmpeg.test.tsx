import { FFmpeg } from '@ffmpeg/ffmpeg';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { useFFmpeg } from './useFFmpeg';

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn(),
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
}));

interface MockFFmpeg {
  loaded: boolean;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  load: ReturnType<typeof vi.fn>;
  exec: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  readFile: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
}

const defaultFile = new File([], 'video.mp4', { type: 'video/mp4' });

interface TestComponentProps {
  file?: File;
}

function TestComponent({ file = defaultFile }: TestComponentProps) {
  const ffmpeg = useFFmpeg();
  const [result, setResult] = useState<Uint8Array | null>(null);

  return (
    <div>
      <span aria-label="Loaded">{String(ffmpeg.loaded)}</span>
      <span aria-label="Loading">{String(ffmpeg.loading)}</span>
      <span aria-label="Converting">{String(ffmpeg.converting)}</span>
      <span aria-label="Progress">{Math.round(ffmpeg.progress * 100)}</span>
      <span aria-label="Error">{ffmpeg.error ?? 'no-error'}</span>
      <span aria-label="Result">{result ? 'has-result' : 'no-result'}</span>

      <button
        onClick={() => {
          void ffmpeg.load();
        }}
        type="button"
      >
        Load
      </button>

      <button
        onClick={() => {
          void (async () => {
            try {
              const data = await ffmpeg.convert(file, 'output.mp4', [
                '-i',
                'input.mp4',
              ]);
              setResult(data);
            } catch {
              // errors are reflected in state
            }
          })();
        }}
        type="button"
      >
        Convert
      </button>

      <button onClick={ffmpeg.resetError} type="button">
        Reset
      </button>
    </div>
  );
}

describe('useFFmpeg hook', () => {
  let mockFFmpeg: MockFFmpeg;
  let progressCallback: ((payload: { progress: number }) => void) | null = null;

  function createMockFFmpeg(overrides: Partial<MockFFmpeg> = {}): MockFFmpeg {
    return {
      loaded: false,
      on: vi.fn(
        (event: string, callback: (payload: { progress: number }) => void) => {
          if (event === 'progress') {
            progressCallback = callback;
          }
        },
      ),
      off: vi.fn(),
      load: vi.fn(() => {
        mockFFmpeg.loaded = true;
        return Promise.resolve(true);
      }),
      exec: vi.fn(() => {
        progressCallback?.({ progress: 0.5 });
        return Promise.resolve(0);
      }),
      writeFile: vi.fn(() => Promise.resolve(true)),
      readFile: vi.fn(() => Promise.resolve(new Uint8Array([4, 5, 6]))),
      terminate: vi.fn(),
      ...overrides,
    };
  }

  beforeEach(() => {
    progressCallback = null;
    mockFFmpeg = createMockFFmpeg();
    vi.mocked(FFmpeg).mockImplementation(function mockFFmpegConstructor() {
      return mockFFmpeg as unknown as FFmpeg;
    });
  });

  it('starts in idle state', () => {
    render(<TestComponent />);

    expect(screen.getByLabelText('Loaded')).toHaveTextContent('false');
    expect(screen.getByLabelText('Loading')).toHaveTextContent('false');
    expect(screen.getByLabelText('Converting')).toHaveTextContent('false');
    expect(screen.getByLabelText('Progress')).toHaveTextContent('0');
    expect(screen.getByLabelText('Error')).toHaveTextContent('no-error');
  });

  it('loads ffmpeg successfully', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /load/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Loaded')).toHaveTextContent('true');
    });
    expect(screen.getByLabelText('Loading')).toHaveTextContent('false');
  });

  it('skips loading if already loaded', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /load/i }));
    await user.click(screen.getByRole('button', { name: /load/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Loaded')).toHaveTextContent('true');
    });
    expect(mockFFmpeg.load).toHaveBeenCalledTimes(1);
  });

  it('reports load errors', async () => {
    const user = userEvent.setup();
    mockFFmpeg.load = vi.fn(() => Promise.reject(new Error('network failure')));

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /load/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'network failure',
      );
    });
    expect(screen.getByLabelText('Loaded')).toHaveTextContent('false');
  });

  it('converts a file successfully', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Result')).toHaveTextContent('has-result');
    });
    expect(screen.getByLabelText('Converting')).toHaveTextContent('false');
  });

  it('falls back to bin extension when the file has no extension', async () => {
    const user = userEvent.setup();
    const fileWithoutExtension = new File([], 'video', { type: 'video/mp4' });

    render(<TestComponent file={fileWithoutExtension} />);

    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Result')).toHaveTextContent('has-result');
    });
  });

  it('reports progress during conversion', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Progress')).toHaveTextContent('50');
    });
  });

  it('reports conversion errors', async () => {
    const user = userEvent.setup();
    mockFFmpeg.exec = vi.fn(() => Promise.resolve(1));

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'FFmpeg exited with code 1',
      );
    });
  });

  it('throws when ffmpeg fails to load during convert', async () => {
    const user = userEvent.setup();
    mockFFmpeg.load = vi.fn(() => Promise.reject(new Error('bad url')));

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent('bad url');
    });
  });

  it('reports unexpected output data format', async () => {
    const user = userEvent.setup();
    mockFFmpeg.readFile = vi.fn(() => Promise.resolve('not a buffer'));

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'Unexpected output data format',
      );
    });
  });

  it('throws when ffmpeg remains unloaded', async () => {
    const user = userEvent.setup();
    mockFFmpeg.load = vi.fn(() => Promise.resolve(true));
    mockFFmpeg.loaded = false;

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent(
        'FFmpeg is not loaded',
      );
    });
  });

  it('clears error on reset', async () => {
    const user = userEvent.setup();
    mockFFmpeg.load = vi.fn(() => Promise.reject(new Error('fail')));

    render(<TestComponent />);
    await user.click(screen.getByRole('button', { name: /load/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Error')).toHaveTextContent('fail');
    });

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByLabelText('Error')).toHaveTextContent('no-error');
  });
});

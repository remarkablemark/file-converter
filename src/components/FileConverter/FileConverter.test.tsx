import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useConverter } from '../../hooks/useConverter';
import { getDefaultOptions } from '../../utils/helpers';
import { FileConverter } from './FileConverter';

vi.mock('../../hooks/useConverter');

const defaultOptions = getDefaultOptions();

function createMockConverter(
  overrides: Partial<ReturnType<typeof useConverter>> = {},
): ReturnType<typeof useConverter> {
  return {
    file: null,
    category: null,
    outputFormat: '',
    outputFilename: 'output.bin',
    options: defaultOptions,
    status: 'idle',
    progress: 0,
    error: null,
    inputUrl: null,
    outputUrl: null,
    isLargeFile: false,
    setFile: vi.fn(),
    setOutputFormat: vi.fn(),
    setOutputFilename: vi.fn(),
    updateOptions: vi.fn(),
    convert: vi.fn(),
    cancel: vi.fn(),
    download: vi.fn(),
    ...overrides,
  };
}

describe('FileConverter component', () => {
  beforeEach(() => {
    vi.mocked(useConverter).mockReturnValue(createMockConverter());
  });

  it('renders the heading and dropzone when no file is selected', () => {
    render(<FileConverter />);

    expect(
      screen.getByRole('heading', { name: /file converter/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /upload file/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/output settings/i)).not.toBeInTheDocument();
  });

  it('shows output settings and image preview for an image file', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'image.png', { type: 'image/png' }),
        category: 'image',
        outputFormat: 'png',
        outputFilename: 'image.png',
        inputUrl: 'blob://input',
      }),
    );

    render(<FileConverter />);

    expect(screen.getByText(/output settings/i)).toBeInTheDocument();
    expect(screen.getByAltText(/original preview/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preserve transparency/i)).toBeInTheDocument();
  });

  it('shows video preview for a video file', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'clip.mp4', { type: 'video/mp4' }),
        category: 'video',
        outputFormat: 'mp4',
        outputFilename: 'clip.mp4',
        inputUrl: 'blob://input',
      }),
    );

    const { container } = render(<FileConverter />);

    expect(screen.getByLabelText(/frame rate/i)).toBeInTheDocument();
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('shows audio preview for an audio file', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'song.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        outputFormat: 'mp3',
        outputFilename: 'song.mp3',
        inputUrl: 'blob://input',
      }),
    );

    const { container } = render(<FileConverter />);

    expect(screen.getByLabelText(/bitrate/i)).toBeInTheDocument();
    expect(container.querySelector('audio')).toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('shows cancel button while busy', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'x.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        status: 'converting',
      }),
    );

    render(<FileConverter />);

    const button = screen.getByRole('button', { name: /cancel/i });
    expect(button).toBeEnabled();
    expect(button).toHaveTextContent('Cancel');
    expect(button.className).toContain('bg-red-600');
  });

  it('disables cancel button while ffmpeg is loading', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'x.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        outputFormat: 'mp3',
        status: 'loading',
      }),
    );

    render(<FileConverter />);

    const button = screen.getByRole('button', { name: /cancel/i });
    expect(button).toBeDisabled();
  });

  it('calls cancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const cancel = vi.fn();

    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'x.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        outputFormat: 'mp3',
        status: 'converting',
        cancel,
      }),
    );

    render(<FileConverter />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(cancel).toHaveBeenCalled();
  });

  it('disables the convert button when no output format is selected', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'x.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        status: 'idle',
      }),
    );

    render(<FileConverter />);

    expect(screen.getByRole('button', { name: /convert$/i })).toBeDisabled();
  });

  it('warns about large files', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'big.mp4', { type: 'video/mp4' }),
        category: 'video',
        isLargeFile: true,
      }),
    );

    render(<FileConverter />);

    expect(screen.getByText(/large file/i)).toBeInTheDocument();
  });

  it('shows conversion errors', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        error: 'Conversion failed',
        status: 'error',
      }),
    );

    render(<FileConverter />);

    expect(screen.getByRole('alert')).toHaveTextContent('Conversion failed');
  });

  it('shows download button after a successful conversion', async () => {
    const user = userEvent.setup();
    const mockDownload = vi.fn();

    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'image.png', { type: 'image/png' }),
        category: 'image',
        outputFormat: 'jpg',
        outputFilename: 'image.jpg',
        status: 'done',
        inputUrl: 'blob://input',
        outputUrl: 'blob://output',
        download: mockDownload,
      }),
    );

    render(<FileConverter />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    expect(downloadButton).toBeInTheDocument();
    expect(screen.getByAltText(/converted preview/i)).toBeInTheDocument();

    await user.click(downloadButton);
    expect(mockDownload).toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: /downloaded/i }),
    ).toBeInTheDocument();
  });

  it('calls setOutputFilename when output filename changes', () => {
    const setOutputFilename = vi.fn();

    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'clip.mp4', { type: 'video/mp4' }),
        category: 'video',
        outputFormat: 'mp4',
        outputFilename: 'clip.mp4',
        setOutputFilename,
      }),
    );

    render(<FileConverter />);

    const input = screen.getByLabelText(/output filename/i);
    fireEvent.change(input, { target: { value: 'renamed.mp4' } });

    expect(setOutputFilename).toHaveBeenCalledWith('renamed.mp4');
  });

  it('calls convert when the convert button is clicked', async () => {
    const user = userEvent.setup();
    const convert = vi.fn();

    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'song.mp3', { type: 'audio/mpeg' }),
        category: 'audio',
        outputFormat: 'mp3',
        convert,
      }),
    );

    render(<FileConverter />);

    await user.click(screen.getByRole('button', { name: /convert$/i }));
    expect(convert).toHaveBeenCalled();
  });

  it('does not render a preview when there is no input URL', () => {
    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'image.png', { type: 'image/png' }),
        category: 'image',
        outputFormat: 'png',
        inputUrl: null,
      }),
    );

    const { container } = render(<FileConverter />);

    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('resets the download confirmation after a delay', () => {
    vi.useFakeTimers();
    const mockDownload = vi.fn();

    vi.mocked(useConverter).mockReturnValue(
      createMockConverter({
        file: new File([], 'image.png', { type: 'image/png' }),
        category: 'image',
        outputFormat: 'jpg',
        outputFilename: 'image.jpg',
        status: 'done',
        outputUrl: 'blob://output',
        download: mockDownload,
      }),
    );

    render(<FileConverter />);

    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(
      screen.getByRole('button', { name: /downloaded/i }),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(
      screen.queryByRole('button', { name: /downloaded/i }),
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

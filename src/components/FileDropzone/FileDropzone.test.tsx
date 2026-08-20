import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileDropzone } from '.';

describe('FileDropzone component', () => {
  it('renders upload prompt', () => {
    render(<FileDropzone onFileSelect={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /upload file/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/drag & drop a file here/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when a file is selected via input', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);

    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }
    const file = new File(['content'], 'video.mp4', { type: 'video/mp4' });
    await user.upload(input, file);

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  function createDropEvent(file: File) {
    const event = new MouseEvent('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: {
        files: [file],
        item: (index: number) => (index === 0 ? file : null),
      },
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    return event as unknown as DragEvent;
  }

  it('handles drop events', () => {
    const onFileSelect = vi.fn();
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);

    const dropzone = container.firstChild as HTMLElement;
    dropzone.dispatchEvent(createDropEvent(file));

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('does not respond to drops when disabled', () => {
    const onFileSelect = vi.fn();
    const file = new File(['content'], 'image.png', { type: 'image/png' });
    const { container } = render(
      <FileDropzone disabled onFileSelect={onFileSelect} />,
    );

    const dropzone = container.firstChild as HTMLElement;
    dropzone.dispatchEvent(createDropEvent(file));

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('does not call onFileSelect when the drop has no files', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);

    const dropzone = container.firstChild as HTMLElement;
    const event = new MouseEvent('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', {
      value: { files: [], item: () => null },
    });
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    dropzone.dispatchEvent(event);

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('opens the file picker when clicked', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }
    const clickSpy = vi.spyOn(input, 'click');

    const dropzone = container.firstChild as HTMLElement;
    dropzone.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens the file picker when Enter or Space is pressed', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }
    const clickSpy = vi.spyOn(input, 'click');

    const dropzone = container.firstChild as HTMLElement;
    fireEvent.keyDown(dropzone, { key: 'Enter' });
    fireEvent.keyDown(dropzone, { key: ' ' });

    expect(clickSpy).toHaveBeenCalled();
  });

  it('ignores key presses other than Enter or Space', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }
    const clickSpy = vi.spyOn(input, 'click');

    const dropzone = container.firstChild as HTMLElement;
    fireEvent.keyDown(dropzone, { key: 'Tab' });

    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('allows drag over without selecting a file', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const dropzone = container.firstChild as HTMLElement;

    fireEvent.dragOver(dropzone);

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('does not call onFileSelect for an empty file input change', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }

    await user.upload(input, []);

    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('does not call onFileSelect when files is null', () => {
    const onFileSelect = vi.fn();
    const { container } = render(<FileDropzone onFileSelect={onFileSelect} />);
    const input =
      container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error('File input not rendered');
    }

    fireEvent.change(input, { target: { files: null } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});

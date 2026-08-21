import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getDefaultOptions } from '../../utils/helpers';
import { OptionsPanel } from '.';

describe('OptionsPanel component', () => {
  const defaultOptions = getDefaultOptions();

  it('renders image options and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '200' },
    });
    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '300' },
    });
    await user.selectOptions(screen.getByLabelText(/fit/i), 'cover');
    await user.click(screen.getByLabelText(/preserve transparency/i));

    expect(onChange).toHaveBeenCalledWith('image', { width: 200 });
    expect(onChange).toHaveBeenCalledWith('image', { height: 300 });
    expect(onChange).toHaveBeenCalledWith('image', { fit: 'cover' });
    expect(onChange).toHaveBeenCalledWith('image', {
      preserveTransparency: false,
    });
  });

  it('renders video options and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp4"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '1280' },
    });
    fireEvent.change(screen.getByLabelText(/frame rate/i), {
      target: { value: '60' },
    });
    await user.click(screen.getByLabelText(/preserve audio/i));

    expect(onChange).toHaveBeenCalledWith('video', { width: 1280 });
    expect(onChange).toHaveBeenCalledWith('video', { fps: 60 });
    expect(onChange).toHaveBeenCalledWith('video', { preserveAudio: false });
  });

  it('shows audio bitrate when preserve audio is enabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      video: { ...defaultOptions.video, preserveAudio: true },
    };

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={options}
        outputFormat="mp4"
      />,
    );

    await user.selectOptions(screen.getByLabelText(/audio bitrate/i), '192k');

    expect(onChange).toHaveBeenCalledWith('video', {
      audioBitrate: '192k',
    });
  });

  it('shows loop option for gif output', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="gif"
      />,
    );

    await user.click(screen.getByLabelText(/loop forever/i));

    expect(onChange).toHaveBeenCalledWith('video', { loop: true });
  });

  it('renders audio options and reports changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="audio"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp3"
      />,
    );

    await user.selectOptions(screen.getByLabelText(/bitrate/i), '320k');
    await user.selectOptions(screen.getByLabelText(/sample rate/i), '48000');
    await user.selectOptions(screen.getByLabelText(/channels/i), 'mono');

    expect(onChange).toHaveBeenCalledWith('audio', { bitrate: '320k' });
    expect(onChange).toHaveBeenCalledWith('audio', { sampleRate: 48000 });
    expect(onChange).toHaveBeenCalledWith('audio', { channels: 'mono' });
  });

  it('covers all image option controls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '200' },
    });
    await user.selectOptions(screen.getByLabelText(/fit/i), 'contain');
    fireEvent.change(screen.getByLabelText(/quality/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText(/background/i), {
      target: { value: '#123456' },
    });

    expect(onChange).toHaveBeenCalledWith('image', { width: 100 });
    expect(onChange).toHaveBeenCalledWith('image', { height: 200 });
    expect(onChange).toHaveBeenCalledWith('image', { fit: 'contain' });
    expect(onChange).toHaveBeenCalledWith('image', { quality: 50 });
    expect(onChange).toHaveBeenCalledWith('image', { background: '#123456' });
  });

  it('covers all video option controls', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp4"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '640' },
    });
    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '480' },
    });
    await user.selectOptions(screen.getByLabelText(/fit/i), 'stretch');
    fireEvent.change(screen.getByLabelText(/frame rate/i), {
      target: { value: '24' },
    });
    fireEvent.change(screen.getByLabelText(/quality/i), {
      target: { value: '28' },
    });

    expect(onChange).toHaveBeenCalledWith('video', { width: 640 });
    expect(onChange).toHaveBeenCalledWith('video', { height: 480 });
    expect(onChange).toHaveBeenCalledWith('video', { fit: 'stretch' });
    expect(onChange).toHaveBeenCalledWith('video', { fps: 24 });
    expect(onChange).toHaveBeenCalledWith('video', { quality: 28 });
  });

  it('toggles audio bitrate visibility with preserve audio', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      video: { ...defaultOptions.video, preserveAudio: false },
    };

    const { rerender } = render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={options}
        outputFormat="mp4"
      />,
    );

    expect(screen.queryByLabelText(/audio bitrate/i)).not.toBeInTheDocument();

    rerender(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp4"
      />,
    );

    expect(screen.getByLabelText(/audio bitrate/i)).toBeInTheDocument();
  });

  it('falls back to undefined for empty option values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <OptionsPanel
        category="audio"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp3"
      />,
    );

    await user.selectOptions(screen.getByLabelText(/bitrate/i), '');
    expect(onChange).toHaveBeenCalledWith('audio', { bitrate: undefined });

    rerender(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp4"
      />,
    );

    await user.selectOptions(screen.getByLabelText(/audio bitrate/i), '');
    expect(onChange).toHaveBeenCalledWith('video', {
      audioBitrate: undefined,
    });
  });

  it('falls back to undefined for empty numeric inputs', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      image: { ...defaultOptions.image, width: 100, height: 100 },
    };

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={options}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '-1' },
    });

    expect(onChange).toHaveBeenCalledWith('image', { width: undefined });
    expect(onChange).toHaveBeenCalledWith('image', { height: undefined });
  });

  it('toggles preserve aspect ratio checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="png"
      />,
    );

    await user.click(screen.getByLabelText(/preserve aspect ratio/i));

    expect(onChange).toHaveBeenCalledWith('image', {
      preserveAspectRatio: false,
    });
  });

  it('updates height proportionally when preserve aspect ratio is enabled', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      image: {
        ...defaultOptions.image,
        width: 800,
        height: 600,
        originalWidth: 800,
        originalHeight: 600,
        preserveAspectRatio: true,
      },
    };

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={options}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '400' },
    });

    expect(onChange).toHaveBeenCalledWith('image', {
      width: 400,
      height: 300,
    });
  });

  it('updates width proportionally when preserve aspect ratio is enabled', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      video: {
        ...defaultOptions.video,
        width: 1920,
        height: 1080,
        originalWidth: 1920,
        originalHeight: 1080,
        preserveAspectRatio: true,
      },
    };

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={options}
        outputFormat="mp4"
      />,
    );

    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '540' },
    });

    expect(onChange).toHaveBeenCalledWith('video', {
      height: 540,
      width: 960,
    });
  });

  it('does not link dimensions when preserve aspect ratio is disabled', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      image: {
        ...defaultOptions.image,
        width: 800,
        height: 600,
        preserveAspectRatio: false,
      },
    };

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={options}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '400' },
    });

    expect(onChange).toHaveBeenCalledWith('image', { width: 400 });
  });

  it('updates image height and linked width when preserve aspect ratio is enabled', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      image: {
        ...defaultOptions.image,
        width: 800,
        height: 600,
        originalWidth: 800,
        originalHeight: 600,
        preserveAspectRatio: true,
      },
    };

    render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={options}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/height/i), {
      target: { value: '300' },
    });

    expect(onChange).toHaveBeenCalledWith('image', {
      height: 300,
      width: 400,
    });
  });

  it('updates video width and linked height when preserve aspect ratio is enabled', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      video: {
        ...defaultOptions.video,
        width: 1920,
        height: 1080,
        originalWidth: 1920,
        originalHeight: 1080,
        preserveAspectRatio: true,
      },
    };

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={options}
        outputFormat="mp4"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '960' },
    });

    expect(onChange).toHaveBeenCalledWith('video', {
      width: 960,
      height: 540,
    });
  });

  it('toggles preserve aspect ratio checkbox for video', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <OptionsPanel
        category="video"
        onChange={onChange}
        options={defaultOptions}
        outputFormat="mp4"
      />,
    );

    await user.click(screen.getByLabelText(/preserve aspect ratio/i));

    expect(onChange).toHaveBeenCalledWith('video', {
      preserveAspectRatio: false,
    });
  });

  it('maintains correct ratio across sequential width changes', () => {
    const onChange = vi.fn();
    const options = {
      ...defaultOptions,
      image: {
        ...defaultOptions.image,
        width: 800,
        height: 600,
        originalWidth: 800,
        originalHeight: 600,
        preserveAspectRatio: true,
      },
    };

    const { rerender } = render(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={options}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '4' },
    });

    let lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall).toEqual(['image', { width: 4, height: 3 }]);

    const updatedOptions = {
      ...options,
      image: { ...options.image, width: 4, height: 3 },
    };
    rerender(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={updatedOptions}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '40' },
    });

    lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall).toEqual(['image', { width: 40, height: 30 }]);

    const updatedOptions2 = {
      ...options,
      image: { ...options.image, width: 40, height: 30 },
    };
    rerender(
      <OptionsPanel
        category="image"
        onChange={onChange}
        options={updatedOptions2}
        outputFormat="png"
      />,
    );

    fireEvent.change(screen.getByLabelText(/width/i), {
      target: { value: '400' },
    });

    lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
    expect(lastCall).toEqual(['image', { width: 400, height: 300 }]);
  });
});

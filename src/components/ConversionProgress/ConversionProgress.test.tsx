import { render, screen } from '@testing-library/react';

import { ConversionProgress } from '.';

describe('ConversionProgress component', () => {
  it('renders nothing when idle and there is no error', () => {
    const { container } = render(
      <ConversionProgress error={null} progress={0} status="idle" />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading state', () => {
    render(<ConversionProgress error={null} progress={0} status="loading" />);

    expect(screen.getByText(/loading ffmpeg/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows converting progress', () => {
    render(
      <ConversionProgress error={null} progress={0.45} status="converting" />,
    );

    expect(screen.getByText(/converting... 45%/i)).toBeInTheDocument();
  });

  it('displays errors', () => {
    render(
      <ConversionProgress
        error="Something went wrong"
        progress={0}
        status="error"
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});

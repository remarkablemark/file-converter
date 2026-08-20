import { render, screen } from '@testing-library/react';

import { App } from '.';

describe('App component', () => {
  it('renders the file converter', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /file converter/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /upload file/i }),
    ).toBeInTheDocument();
  });
});

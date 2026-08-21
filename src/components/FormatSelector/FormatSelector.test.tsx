import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormatSelector } from '.';

describe('FormatSelector component', () => {
  it('renders disabled placeholder when no category is selected', () => {
    render(<FormatSelector category={null} onChange={vi.fn()} value="" />);

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveValue('');
  });

  it('lists formats for the selected category', () => {
    render(<FormatSelector category="video" onChange={vi.fn()} value="mp4" />);

    const options = screen.getAllByRole('option');
    const values = options.map((option) => (option as HTMLOptionElement).value);

    expect(values).toContain('mp4');
    expect(values).toContain('webm');
    expect(values).not.toContain('png');
  });

  it('calls onChange when a format is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FormatSelector category="image" onChange={onChange} value="png" />);

    await user.selectOptions(screen.getByRole('combobox'), 'jpg');

    expect(onChange).toHaveBeenCalledWith('jpg');
  });
});

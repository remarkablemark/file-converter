import type { Category } from '../../utils/constants';
import { getOutputFormats } from '../../utils/formats';

export interface FormatSelectorProps {
  category: Category | null;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function FormatSelector({
  category,
  value,
  onChange,
  disabled = false,
}: FormatSelectorProps) {
  const formats = category ? getOutputFormats(category) : [];

  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      Output format
      <select
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        disabled={disabled || !category}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        value={value}
      >
        {!category && <option value="">Select a file first</option>}

        {formats.map((format) => (
          <option key={format.value} value={format.value}>
            {format.label}
          </option>
        ))}
      </select>
    </label>
  );
}

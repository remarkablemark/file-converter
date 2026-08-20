export interface ConversionProgressProps {
  status: string;
  progress: number;
  error: string | null;
}

export function ConversionProgress({
  status,
  progress,
  error,
}: ConversionProgressProps) {
  const isActive = status === 'loading' || status === 'converting';

  if (!isActive && !error) {
    return null;
  }

  const label =
    status === 'loading'
      ? 'Loading FFmpeg...'
      : `Converting... ${String(Math.round(progress * 100))}%`;

  return (
    <div className="space-y-2">
      {isActive && (
        <>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </p>

          <div
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(progress * 100)}
            className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700"
            role="progressbar"
          >
            <div
              className="h-2.5 rounded-full bg-slate-600 transition-all dark:bg-slate-400"
              style={{ width: `${String(Math.round(progress * 100))}%` }}
            />
          </div>
        </>
      )}

      {error && (
        <p
          className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

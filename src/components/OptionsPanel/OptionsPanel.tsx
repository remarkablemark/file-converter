import type {
  AudioOptions,
  ConversionOptions,
  ImageOptions,
  VideoOptions,
} from '../../types/converter';
import type { Category } from '../../utils/constants';

export interface OptionsPanelProps {
  category: Category;
  options: ConversionOptions;
  outputFormat: string;
  onChange: (
    category: Category,
    patch: Partial<ImageOptions | VideoOptions | AudioOptions>,
  ) => void;
  disabled?: boolean;
}

function parseOptionalInt(value: string): number | undefined {
  if (value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return parsed > 0 ? parsed : undefined;
}

function ImageSection({
  options,
  disabled,
  onChange,
}: {
  options: ImageOptions;
  disabled?: boolean;
  onChange: (patch: Partial<ImageOptions>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Width (px)
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          min={1}
          onChange={(event) => {
            onChange({ width: parseOptionalInt(event.target.value) });
          }}
          type="number"
          value={options.width ?? ''}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Height (px)
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          min={1}
          onChange={(event) => {
            onChange({ height: parseOptionalInt(event.target.value) });
          }}
          type="number"
          value={options.height ?? ''}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Fit
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          onChange={(event) => {
            onChange({ fit: event.target.value as ImageOptions['fit'] });
          }}
          value={options.fit}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
          <option value="stretch">Stretch</option>
          <option value="force">Force</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Quality
        <input
          className="mt-1 block w-full accent-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          max={100}
          min={0}
          onChange={(event) => {
            onChange({ quality: Number(event.target.value) });
          }}
          type="range"
          value={options.quality}
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {options.quality}
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input
          checked={options.preserveTransparency}
          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onChange={(event) => {
            onChange({ preserveTransparency: event.target.checked });
          }}
          type="checkbox"
        />
        Preserve transparency
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Background
        <input
          className="mt-1 h-10 w-full cursor-pointer rounded-md border border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
          disabled={disabled}
          onChange={(event) => {
            onChange({ background: event.target.value });
          }}
          type="color"
          value={options.background}
        />
      </label>
    </div>
  );
}

function VideoSection({
  options,
  outputFormat,
  disabled,
  onChange,
}: {
  options: VideoOptions;
  outputFormat: string;
  disabled?: boolean;
  onChange: (patch: Partial<VideoOptions>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Width (px)
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          min={1}
          onChange={(event) => {
            onChange({ width: parseOptionalInt(event.target.value) });
          }}
          type="number"
          value={options.width ?? ''}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Height (px)
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          min={1}
          onChange={(event) => {
            onChange({ height: parseOptionalInt(event.target.value) });
          }}
          type="number"
          value={options.height ?? ''}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Fit
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          onChange={(event) => {
            onChange({ fit: event.target.value as VideoOptions['fit'] });
          }}
          value={options.fit}
        >
          <option value="contain">Contain</option>
          <option value="cover">Cover</option>
          <option value="stretch">Stretch</option>
          <option value="force">Force</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Frame rate (fps)
        <input
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          min={1}
          onChange={(event) => {
            onChange({ fps: parseOptionalInt(event.target.value) });
          }}
          type="number"
          value={options.fps ?? ''}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Quality (CRF)
        <input
          className="mt-1 block w-full accent-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          max={51}
          min={0}
          onChange={(event) => {
            onChange({ quality: Number(event.target.value) });
          }}
          type="range"
          value={options.quality}
        />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {options.quality}
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input
          checked={options.preserveAudio}
          className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onChange={(event) => {
            onChange({ preserveAudio: event.target.checked });
          }}
          type="checkbox"
        />
        Preserve audio
      </label>

      {options.preserveAudio && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Audio bitrate
          <select
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            disabled={disabled}
            onChange={(event) => {
              onChange({
                audioBitrate: event.target.value || undefined,
              });
            }}
            value={options.audioBitrate ?? ''}
          >
            <option value="">Default</option>
            <option value="64k">64k</option>
            <option value="128k">128k</option>
            <option value="192k">192k</option>
            <option value="256k">256k</option>
            <option value="320k">320k</option>
          </select>
        </label>
      )}

      {outputFormat === 'gif' && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <input
            checked={options.loop}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            onChange={(event) => {
              onChange({ loop: event.target.checked });
            }}
            type="checkbox"
          />
          Loop forever
        </label>
      )}
    </div>
  );
}

function AudioSection({
  options,
  disabled,
  onChange,
}: {
  options: AudioOptions;
  disabled?: boolean;
  onChange: (patch: Partial<AudioOptions>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Bitrate
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          onChange={(event) => {
            onChange({ bitrate: event.target.value || undefined });
          }}
          value={options.bitrate ?? ''}
        >
          <option value="">Default</option>
          <option value="64k">64k</option>
          <option value="128k">128k</option>
          <option value="192k">192k</option>
          <option value="256k">256k</option>
          <option value="320k">320k</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Sample rate (Hz)
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          onChange={(event) => {
            onChange({ sampleRate: parseOptionalInt(event.target.value) });
          }}
          value={options.sampleRate ?? ''}
        >
          <option value="">Default</option>
          <option value="22050">22050</option>
          <option value="44100">44100</option>
          <option value="48000">48000</option>
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Channels
        <select
          className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-xs focus:border-slate-500 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          disabled={disabled}
          onChange={(event) => {
            onChange({
              channels: event.target.value as AudioOptions['channels'],
            });
          }}
          value={options.channels}
        >
          <option value="mono">Mono</option>
          <option value="stereo">Stereo</option>
        </select>
      </label>
    </div>
  );
}

export function OptionsPanel({
  category,
  options,
  outputFormat,
  onChange,
  disabled,
}: OptionsPanelProps) {
  if (category === 'image') {
    return (
      <ImageSection
        disabled={disabled}
        onChange={(patch) => {
          onChange('image', patch);
        }}
        options={options.image}
      />
    );
  }

  if (category === 'video') {
    return (
      <VideoSection
        disabled={disabled}
        onChange={(patch) => {
          onChange('video', patch);
        }}
        options={options.video}
        outputFormat={outputFormat}
      />
    );
  }

  return (
    <AudioSection
      disabled={disabled}
      onChange={(patch) => {
        onChange('audio', patch);
      }}
      options={options.audio}
    />
  );
}

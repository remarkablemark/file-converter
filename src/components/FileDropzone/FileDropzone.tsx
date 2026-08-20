import { useRef } from 'react';

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      onFileSelect(selectedFile);
    }

    event.target.value = '';
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const droppedFile = files.length > 0 ? files[0] : null;

    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }

  return (
    <div
      className={`rounded-lg border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-slate-500 dark:border-slate-600 dark:hover:border-slate-400 ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
      onClick={disabled ? undefined : handleClick}
      onKeyDown={disabled ? undefined : handleKeyDown}
      onDragOver={handleDragOver}
      onDrop={disabled ? undefined : handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload file"
    >
      <p className="text-slate-600 dark:text-slate-300">
        Drag & drop a file here, or click to upload
      </p>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        onChange={handleChange}
        aria-hidden
      />
    </div>
  );
}

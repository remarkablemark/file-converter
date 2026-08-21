import { useRef, useState } from 'react';

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!dragActive) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const files = event.dataTransfer.files;
    const droppedFile = files.length > 0 ? files[0] : null;

    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }

  const dropzoneStyling = dragActive
    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
    : disabled
      ? 'cursor-not-allowed border-slate-300 opacity-50 dark:border-slate-600'
      : 'cursor-pointer border-slate-300 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/30';

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dropzoneStyling}`}
      onClick={disabled ? undefined : handleClick}
      onKeyDown={disabled ? undefined : handleKeyDown}
      onDragEnter={disabled ? undefined : handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
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

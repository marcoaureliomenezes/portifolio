import { useEffect, useState } from "react";

const RESET_MS = 2000;

interface CodeBlockProps {
  code: string;
  copyLabel: string;
  copiedLabel: string;
  onCopy?: () => void;
}

export function CodeBlock({ code, copyLabel, copiedLabel, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), RESET_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    onCopy?.();
  };

  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-muted px-4 py-3">
      <pre className="text-meta overflow-x-auto min-w-0">{code}</pre>
      <button
        type="button"
        onClick={copy}
        className="text-label shrink-0 rounded px-2 py-1 hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

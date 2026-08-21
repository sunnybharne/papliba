import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from './Icons';

interface CopyCodeProps {
  children: string;
  label?: string;
}

export function CopyCode({ children, label = 'Terminal' }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    await navigator.clipboard.writeText(children);
    setCopied(true);
  }

  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span>{label}</span>
        <button type="button" onClick={() => void copy()} aria-label="Copy code">
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

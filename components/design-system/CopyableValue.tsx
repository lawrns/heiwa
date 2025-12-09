'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyableValueProps {
  value: string;
  displayValue?: string;
  className?: string;
}

export function CopyableValue({ value, displayValue, className }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono",
        "bg-gray-100 hover:bg-gray-200 transition-colors",
        "group cursor-pointer",
        className
      )}
      title={`Click to copy: ${value}`}
    >
      <span className="text-gray-700">{displayValue || value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

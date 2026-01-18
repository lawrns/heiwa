'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  name: string;
  hex: string;
  variable?: string;
  tailwindClass?: string;
  usage?: string;
  className?: string;
  textColor?: 'black' | 'white';
}

export function ColorSwatch({
  name,
  hex,
  variable,
  tailwindClass,
  usage,
  className,
  textColor = 'black',
}: ColorSwatchProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const contrastColor = textColor === 'white' ? '#FFFFFF' : '#000000';

  const handleCopy = async (value: string, type: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <button
        onClick={() => handleCopy(hex, 'hex')}
        className="h-32 w-full rounded-lg shadow-sm flex items-center justify-center border border-gray-200 cursor-pointer transition-[transform,box-shadow,background-color] duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 group relative"
        style={{ backgroundColor: hex }}
        title={`Click to copy ${hex}`}
      >
        <span className="font-mono text-sm font-medium flex items-center gap-2" style={{ color: contrastColor }}>
          {hex}
          {copied === 'hex' ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4 opacity-0 group-hover:opacity-70 transition-opacity" />
          )}
        </span>
      </button>
      <div className="space-y-1">
        <h4 className="font-semibold text-sm">{name}</h4>
        {variable && (
          <button
            onClick={() => handleCopy(variable, 'variable')}
            className="flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-gray-900 transition-colors duration-200 group focus-visible:outline-none focus-visible:underline"
            title={`Click to copy ${variable}`}
          >
            {variable}
            {copied === 'variable' ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        )}
        {tailwindClass && (
          <button
            onClick={() => handleCopy(tailwindClass, 'tailwind')}
            className="flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-gray-900 transition-colors duration-200 group focus-visible:outline-none focus-visible:underline"
            title={`Click to copy ${tailwindClass}`}
          >
            {tailwindClass}
            {copied === 'tailwind' ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        )}
        {usage && <p className="text-xs text-gray-600 mt-1">{usage}</p>}
      </div>
    </div>
  );
}


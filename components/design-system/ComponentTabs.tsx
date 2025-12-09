'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentTabsProps {
  preview: React.ReactNode;
  code: string;
  className?: string;
}

export function ComponentTabs({ preview, code, className }: ComponentTabsProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("border border-gray-200 rounded-xl overflow-hidden bg-white", className)}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'preview'
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Preview
            {activeTab === 'preview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === 'code'
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Code
            {activeTab === 'code' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {activeTab === 'code' && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-6">
        {activeTab === 'preview' ? (
          <div>{preview}</div>
        ) : (
          <pre className="text-sm font-mono text-gray-800 bg-gray-50 p-4 rounded-lg overflow-x-auto">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

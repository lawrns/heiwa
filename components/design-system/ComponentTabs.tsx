'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { CodeBlock } from './CodeBlock';

interface ComponentTabsProps {
  preview: React.ReactNode;
  code: string;
  className?: string;
}

export function ComponentTabs({ preview, code, className }: ComponentTabsProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white", className)}>
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-[color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heiwaOrange-500",
            activeTab === 'preview' 
              ? "text-gray-900 bg-white border-b-2 border-heiwaOrange-500 -mb-px" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-[color,border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heiwaOrange-500",
            activeTab === 'code' 
              ? "text-gray-900 bg-white border-b-2 border-heiwaOrange-500 -mb-px" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Code
        </button>
      </div>
      <div className="p-6">
        {activeTab === 'preview' ? (
          <div>{preview}</div>
        ) : (
          <CodeBlock code={code} />
        )}
      </div>
    </div>
  );
}

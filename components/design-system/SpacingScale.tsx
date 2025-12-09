'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface SpacingItemProps {
  value: number;
  tailwindClass: string;
  pixels: number;
  isCustom?: boolean;
  customName?: string;
}

function SpacingItem({ value, tailwindClass, pixels, isCustom, customName }: SpacingItemProps) {
  return (
    <div className="flex items-center gap-4 py-2 group">
      <div className="w-16 text-right">
        <span className="text-sm font-mono text-gray-500">{pixels}px</span>
      </div>
      <div
        className={cn(
          "h-6 rounded transition-all duration-200",
          isCustom ? "bg-accent/80" : "bg-primary/60",
          "group-hover:opacity-80"
        )}
        style={{ width: `${Math.max(pixels, 4)}px` }}
      />
      <div className="flex items-center gap-3">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
          {tailwindClass}
        </code>
        {isCustom && customName && (
          <span className="text-xs text-accent font-medium">{customName}</span>
        )}
      </div>
    </div>
  );
}

export function SpacingScale() {
  const baseScale = [
    { value: 0, tailwindClass: 'p-0', pixels: 0 },
    { value: 0.5, tailwindClass: 'p-0.5', pixels: 2 },
    { value: 1, tailwindClass: 'p-1', pixels: 4 },
    { value: 1.5, tailwindClass: 'p-1.5', pixels: 6 },
    { value: 2, tailwindClass: 'p-2', pixels: 8 },
    { value: 2.5, tailwindClass: 'p-2.5', pixels: 10 },
    { value: 3, tailwindClass: 'p-3', pixels: 12 },
    { value: 3.5, tailwindClass: 'p-3.5', pixels: 14 },
    { value: 4, tailwindClass: 'p-4', pixels: 16 },
    { value: 5, tailwindClass: 'p-5', pixels: 20 },
    { value: 6, tailwindClass: 'p-6', pixels: 24 },
    { value: 7, tailwindClass: 'p-7', pixels: 28 },
    { value: 8, tailwindClass: 'p-8', pixels: 32 },
    { value: 9, tailwindClass: 'p-9', pixels: 36 },
    { value: 10, tailwindClass: 'p-10', pixels: 40 },
    { value: 11, tailwindClass: 'p-11', pixels: 44 },
    { value: 12, tailwindClass: 'p-12', pixels: 48 },
    { value: 14, tailwindClass: 'p-14', pixels: 56 },
    { value: 16, tailwindClass: 'p-16', pixels: 64 },
    { value: 20, tailwindClass: 'p-20', pixels: 80 },
    { value: 24, tailwindClass: 'p-24', pixels: 96 },
  ];

  const customTokens = [
    { tailwindClass: 'py-section-y', pixels: 80, customName: 'Section Vertical' },
    { tailwindClass: 'py-section-y-lg', pixels: 120, customName: 'Section Vertical Large' },
    { tailwindClass: 'gap-grid-gap', pixels: 24, customName: 'Grid Gap' },
    { tailwindClass: 'p-card-padding', pixels: 40, customName: 'Card Padding' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Base Scale</h4>
        <p className="text-sm text-gray-600 mb-6">
          Tailwind's spacing scale follows a 4px base unit. Use these values for margins, padding, gaps, and positioning.
        </p>
        <div className="space-y-1">
          {baseScale.map((item) => (
            <SpacingItem key={item.value} {...item} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Semantic Tokens</h4>
        <p className="text-sm text-gray-600 mb-6">
          Custom spacing tokens for consistent layout patterns across the application.
        </p>
        <div className="space-y-1">
          {customTokens.map((item) => (
            <SpacingItem
              key={item.tailwindClass}
              value={0}
              tailwindClass={item.tailwindClass}
              pixels={item.pixels}
              isCustom
              customName={item.customName}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Container Widths</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 w-32">max-w-content</code>
            <span className="text-sm text-gray-600">1200px — Main content area</span>
          </div>
          <div className="flex items-center gap-4">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 w-32">max-w-container</code>
            <span className="text-sm text-gray-600">1400px — Full-width sections</span>
          </div>
        </div>
      </div>
    </div>
  );
}

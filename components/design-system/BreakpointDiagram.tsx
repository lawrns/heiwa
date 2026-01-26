'use client';

import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const breakpoints = [
  { name: 'sm', minWidth: '640px', icon: Smartphone, description: 'Small devices, landscape phones' },
  { name: 'md', minWidth: '768px', icon: Tablet, description: 'Tablets, portrait' },
  { name: 'lg', minWidth: '1024px', icon: Tablet, description: 'Tablets landscape, small laptops' },
  { name: 'xl', minWidth: '1280px', icon: Monitor, description: 'Desktops' },
  { name: '2xl', minWidth: '1536px', icon: Monitor, description: 'Large desktops' },
];

const containerWidths = [
  { breakpoint: 'default', maxWidth: '100%' },
  { breakpoint: 'sm', maxWidth: '640px' },
  { breakpoint: 'md', maxWidth: '768px' },
  { breakpoint: 'lg', maxWidth: '1024px' },
  { breakpoint: 'xl', maxWidth: '1280px' },
  { breakpoint: '2xl', maxWidth: '1400px (custom)' },
];

export function BreakpointDiagram() {
  return (
    <div className="space-y-8">
      {/* Breakpoint Scale */}
      <div>
        <h3 className="text-base font-medium mb-4">Breakpoint Scale</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Prefix</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Min Width</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((bp) => (
                  <tr key={bp.name} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <bp.icon className="h-4 w-4 text-heiwaOrange-500" />
                        <code className="font-mono text-heiwaOrange-600">{bp.name}:</code>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{bp.minWidth}</td>
                    <td className="px-4 py-3 text-gray-500">{bp.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Diagram */}
      <div>
        <h3 className="text-base font-medium mb-4">Visual Representation</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-3">
            {breakpoints.map((bp, index) => {
              const widthPercent = 20 + (index * 16); // 20%, 36%, 52%, 68%, 84%
              return (
                <div key={bp.name} className="flex items-center gap-4">
                  <code className="font-mono text-sm text-gray-500 w-12">{bp.name}</code>
                  <div className="flex-1 h-8 bg-gray-100 rounded relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-heiwaOrange-400 to-heiwaOrange-500 rounded flex items-center justify-end pr-2"
                      style={{ width: `${widthPercent}%` }}
                    >
                      <span className="text-xs text-white font-medium">{bp.minWidth}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Container Widths */}
      <div>
        <h3 className="text-base font-medium mb-4">Container Max Widths</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap gap-2">
            {containerWidths.map((cw) => (
              <div key={cw.breakpoint} className="bg-gray-100 rounded px-3 py-2 text-sm">
                <code className="text-heiwaOrange-600">{cw.breakpoint}:</code>
                <span className="text-gray-600 ml-1">{cw.maxWidth}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <h3 className="text-base font-medium mb-4">Usage Examples</h3>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 font-mono">
{`{/* Mobile-first responsive classes */}
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>

<div className="text-base md:text-lg lg:text-xl">
  {/* Responsive text sizing */}
</div>`}
          </pre>
        </div>
      </div>

      {/* Current Viewport */}
      <div className="bg-heiwaOrange-50 border border-heiwaOrange-200 rounded-lg p-4">
        <h4 className="font-medium text-heiwaOrange-800 mb-2">Mobile-First Approach</h4>
        <p className="text-sm text-heiwaOrange-700">
          Always design for mobile first, then use breakpoint prefixes to enhance the layout for larger screens.
          Unprefixed utilities target all screen sizes, prefixed utilities target that breakpoint <em>and above</em>.
        </p>
      </div>
    </div>
  );
}

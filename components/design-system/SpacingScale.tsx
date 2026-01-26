import React from 'react';

const spacingTokens = [
  { name: '0', value: '0px', pixels: 0 },
  { name: '1', value: '0.25rem', pixels: 4 },
  { name: '2', value: '0.5rem', pixels: 8 },
  { name: '3', value: '0.75rem', pixels: 12 },
  { name: '4', value: '1rem', pixels: 16 },
  { name: '5', value: '1.25rem', pixels: 20 },
  { name: '6', value: '1.5rem', pixels: 24 },
  { name: '8', value: '2rem', pixels: 32 },
  { name: '10', value: '2.5rem', pixels: 40 },
  { name: '12', value: '3rem', pixels: 48 },
  { name: '16', value: '4rem', pixels: 64 },
  { name: '20', value: '5rem', pixels: 80 },
  { name: '24', value: '6rem', pixels: 96 },
];

const semanticTokens = [
  { name: 'section-y', value: '80px', usage: 'Vertical section padding' },
  { name: 'section-y-lg', value: '120px', usage: 'Large section padding' },
  { name: 'grid-gap', value: '24px', usage: 'Grid gap between items' },
  { name: 'card-padding', value: '40px', usage: 'Card internal padding' },
];

export function SpacingScale() {
  return (
    <div className="space-y-8">
      {/* Base Scale */}
      <div>
        <h3 className="text-base font-medium mb-4">Base Scale (4px grid)</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Token</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Value</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pixels</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-1/2">Visual</th>
                </tr>
              </thead>
              <tbody>
                {spacingTokens.map((token) => (
                  <tr key={token.name} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-heiwaOrange-600">space-{token.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{token.value}</td>
                    <td className="px-4 py-3 text-gray-700">{token.pixels}px</td>
                    <td className="px-4 py-3">
                      <div 
                        className="h-4 bg-gradient-to-r from-heiwaOrange-400 to-heiwaOrange-500 rounded-sm"
                        style={{ width: Math.min(token.pixels * 2, 200) }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Semantic Tokens */}
      <div>
        <h3 className="text-base font-medium mb-4">Semantic Tokens</h3>
        <div className="grid gap-4">
          {semanticTokens.map((token) => (
            <div key={token.name} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <code className="text-sm font-mono text-heiwaOrange-600">{token.name}</code>
                <p className="text-xs text-gray-500 mt-1">{token.usage}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm text-gray-900">{token.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Example */}
      <div>
        <h3 className="text-base font-medium mb-4">Usage Example</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-heiwaOrange-500 rounded flex items-center justify-center text-white text-xs font-mono">gap-4</div>
              <div className="w-16 h-16 bg-heiwaOrange-500 rounded flex items-center justify-center text-white text-xs font-mono">16px</div>
              <div className="w-16 h-16 bg-heiwaOrange-500 rounded flex items-center justify-center text-white text-xs font-mono">1rem</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Use Tailwind spacing classes: <code className="text-heiwaOrange-600">p-4</code>, <code className="text-heiwaOrange-600">m-6</code>, <code className="text-heiwaOrange-600">gap-8</code>
          </p>
        </div>
      </div>
    </div>
  );
}

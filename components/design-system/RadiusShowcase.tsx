import React from 'react';

const radiusTokens = [
  { name: 'none', class: 'rounded-none', value: '0px', usage: 'Sharp corners' },
  { name: 'sm', class: 'rounded-sm', value: '2px', usage: 'Minimal rounding' },
  { name: 'default', class: 'rounded', value: '4px', usage: 'Base radius' },
  { name: 'md', class: 'rounded-md', value: '6px', usage: 'Medium radius' },
  { name: 'lg', class: 'rounded-lg', value: '8px', usage: 'Standard cards' },
  { name: 'xl', class: 'rounded-xl', value: '12px', usage: 'Large cards, modals' },
  { name: '2xl', class: 'rounded-2xl', value: '16px', usage: 'Hero elements' },
  { name: 'full', class: 'rounded-full', value: '9999px', usage: 'Pills, avatars' },
];

const semanticRadius = [
  { name: 'card', value: '8px', class: 'rounded-card', element: 'Cards, containers' },
  { name: 'button', value: '6px', class: 'rounded-button', element: 'Buttons, inputs' },
  { name: 'image', value: '4px', class: 'rounded-image', element: 'Images, thumbnails' },
];

export function RadiusShowcase() {
  return (
    <div className="space-y-8">
      {/* Visual Scale */}
      <div>
        <h3 className="text-base font-medium mb-4">Radius Scale</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-wrap gap-6 items-end">
            {radiusTokens.map((token) => (
              <div key={token.name} className="text-center">
                <div 
                  className={`w-16 h-16 bg-gradient-to-br from-heiwaOrange-400 to-heiwaOrange-600 ${token.class} mb-2`}
                />
                <code className="text-xs font-mono text-gray-600 block">{token.class}</code>
                <span className="text-xs text-gray-400">{token.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Semantic Tokens */}
      <div>
        <h3 className="text-base font-medium mb-4">Semantic Tokens</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {semanticRadius.map((token) => (
            <div key={token.name} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-3">
                <div 
                  className="w-12 h-12 bg-heiwaOrange-500"
                  style={{ borderRadius: token.value }}
                />
                <div>
                  <code className="text-sm font-mono text-heiwaOrange-600">{token.class}</code>
                  <p className="text-xs text-gray-500">{token.value}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{token.element}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Combined Example */}
      <div>
        <h3 className="text-base font-medium mb-4">Applied Example</h3>
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="bg-white rounded-lg shadow-card p-4 max-w-sm">
            <div className="w-full h-32 bg-gradient-to-br from-heiwaOrange-300 to-heiwaOrange-500 rounded-image mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Ocean View Room</h4>
            <p className="text-sm text-gray-500 mb-4">Wake up to stunning sunrise views.</p>
            <button className="w-full bg-heiwaOrange-500 hover:bg-heiwaOrange-600 text-white py-2 px-4 rounded-button transition-[background-color,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heiwaOrange-500 focus-visible:ring-offset-2">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

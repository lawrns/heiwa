import React from 'react';

const shadows = [
  { 
    name: 'subtle', 
    class: 'shadow-subtle', 
    value: '0 1px 3px rgba(0, 0, 0, 0.06)',
    usage: 'Minimal elevation for subtle depth',
    example: 'Input fields, subtle cards'
  },
  { 
    name: 'card', 
    class: 'shadow-card', 
    value: '0 2px 12px rgba(0, 0, 0, 0.08)',
    usage: 'Standard card elevation',
    example: 'Cards, modals, dropdowns'
  },
  { 
    name: 'card-hover', 
    class: 'shadow-card-hover', 
    value: '0 4px 20px rgba(0, 0, 0, 0.12)',
    usage: 'Elevated state on hover',
    example: 'Interactive cards, highlighted items'
  },
];

export function ShadowShowcase() {
  return (
    <div className="space-y-8">
      {/* Shadow Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {shadows.map((shadow) => (
          <div key={shadow.name} className="space-y-4">
            <div 
              className={`bg-white rounded-lg h-32 flex items-center justify-center ${shadow.class} border border-gray-100`}
            >
              <span className="text-sm font-medium text-gray-700">{shadow.name}</span>
            </div>
            <div className="space-y-1">
              <code className="text-xs font-mono text-heiwaOrange-600">{shadow.class}</code>
              <p className="text-xs text-gray-500">{shadow.usage}</p>
              <p className="text-xs text-gray-400">e.g., {shadow.example}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Demo */}
      <div>
        <h3 className="text-base font-medium mb-4">Interactive Example</h3>
        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-heiwaOrange-400 to-heiwaOrange-600 rounded-lg mb-4" />
            <h4 className="font-semibold text-gray-900 mb-1">Hover me</h4>
            <p className="text-sm text-gray-500">Shadow elevates on hover</p>
          </div>
        </div>
      </div>

      {/* Shadow Values */}
      <div>
        <h3 className="text-base font-medium mb-4">CSS Values</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Token</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">CSS Value</th>
              </tr>
            </thead>
            <tbody>
              {shadows.map((shadow) => (
                <tr key={shadow.name} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-heiwaOrange-600">{shadow.class}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{shadow.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

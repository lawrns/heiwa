import React from 'react';

interface ShadowCardProps {
  name: string;
  token: string;
  value: string;
  usage: string;
}

function ShadowCard({ name, token, value, usage }: ShadowCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-32 h-32 bg-white rounded-lg mb-4 transition-all duration-300"
        style={{ boxShadow: value }}
      />
      <h4 className="font-semibold text-sm mb-1">{name}</h4>
      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 mb-2">
        {token}
      </code>
      <p className="text-xs text-gray-500">{usage}</p>
    </div>
  );
}

export function ShadowShowcase() {
  const shadows = [
    {
      name: 'Subtle',
      token: 'shadow-subtle',
      value: '0 1px 3px rgba(0, 0, 0, 0.06)',
      usage: 'Inputs, minor separation',
    },
    {
      name: 'Card',
      token: 'shadow-card',
      value: '0 2px 12px rgba(0, 0, 0, 0.08)',
      usage: 'Cards, modals, dropdowns',
    },
    {
      name: 'Card Hover',
      token: 'shadow-card-hover',
      value: '0 4px 20px rgba(0, 0, 0, 0.12)',
      usage: 'Hover states, emphasis',
    },
  ];

  return (
    <div className="bg-gray-100 rounded-xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {shadows.map((shadow) => (
          <ShadowCard key={shadow.token} {...shadow} />
        ))}
      </div>
    </div>
  );
}

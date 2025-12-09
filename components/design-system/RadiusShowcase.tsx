import React from 'react';

interface RadiusItemProps {
  name: string;
  token: string;
  value: string;
  usage: string;
}

function RadiusItem({ name, token, value, usage }: RadiusItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-24 h-24 bg-primary mb-4"
        style={{ borderRadius: value }}
      />
      <h4 className="font-semibold text-sm mb-1">{name}</h4>
      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 mb-1">
        {token}
      </code>
      <span className="text-xs text-gray-400 font-mono mb-2">{value}</span>
      <p className="text-xs text-gray-500">{usage}</p>
    </div>
  );
}

export function RadiusShowcase() {
  const radii = [
    {
      name: 'None',
      token: 'rounded-none',
      value: '0px',
      usage: 'Sharp edges, tables',
    },
    {
      name: 'Image',
      token: 'rounded-image',
      value: '4px',
      usage: 'Images, thumbnails',
    },
    {
      name: 'Button',
      token: 'rounded-button',
      value: '6px',
      usage: 'Buttons, inputs',
    },
    {
      name: 'Card',
      token: 'rounded-card',
      value: '8px',
      usage: 'Cards, modals',
    },
    {
      name: 'Large',
      token: 'rounded-xl',
      value: '12px',
      usage: 'Large containers',
    },
    {
      name: 'Full',
      token: 'rounded-full',
      value: '9999px',
      usage: 'Avatars, pills, badges',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {radii.map((radius) => (
          <RadiusItem key={radius.token} {...radius} />
        ))}
      </div>
    </div>
  );
}

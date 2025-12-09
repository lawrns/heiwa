import React from 'react';

interface BreakpointItemProps {
  name: string;
  minWidth: number;
  usage: string;
  color: string;
}

function BreakpointItem({ name, minWidth, usage, color }: BreakpointItemProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div
        className="w-4 h-4 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="w-12 shrink-0">
        <code className="text-sm font-mono font-medium">{name}</code>
      </div>
      <div className="w-20 shrink-0">
        <span className="text-sm text-gray-500">{minWidth}px</span>
      </div>
      <div className="flex-1">
        <span className="text-sm text-gray-600">{usage}</span>
      </div>
    </div>
  );
}

export function BreakpointDiagram() {
  const breakpoints = [
    { name: 'sm', minWidth: 640, usage: 'Large phones (landscape)', color: '#ec681c' },
    { name: 'md', minWidth: 768, usage: 'Tablets', color: '#f77b2f' },
    { name: 'lg', minWidth: 1024, usage: 'Small laptops, tablets (landscape)', color: '#2B5F75' },
    { name: 'xl', minWidth: 1280, usage: 'Desktops', color: '#4A9DB5' },
    { name: '2xl', minWidth: 1536, usage: 'Large displays', color: '#1A4252' },
  ];

  const patterns = [
    {
      name: 'Stack to Side-by-Side',
      description: 'Content stacks vertically on mobile, goes horizontal on larger screens',
      code: 'flex flex-col md:flex-row',
    },
    {
      name: 'Responsive Grid',
      description: '1 column on mobile, 2 on tablet, 3-4 on desktop',
      code: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    },
    {
      name: 'Hide/Show Elements',
      description: 'Toggle visibility at different breakpoints',
      code: 'hidden md:block / md:hidden',
    },
    {
      name: 'Responsive Text',
      description: 'Scale typography with viewport',
      code: 'text-2xl md:text-4xl lg:text-5xl',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-2">Breakpoint Scale</h4>
        <p className="text-sm text-gray-600 mb-6">
          Mobile-first breakpoints. Styles apply from the breakpoint width and up.
        </p>

        {/* Visual diagram */}
        <div className="mb-8 overflow-x-auto">
          <div className="min-w-[600px] h-12 bg-gray-100 rounded-lg relative">
            {breakpoints.map((bp, index) => {
              const left = ((bp.minWidth - 320) / (1536 - 320)) * 100;
              return (
                <div
                  key={bp.name}
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: `${left}%` }}
                >
                  <div
                    className="w-0.5 h-full"
                    style={{ backgroundColor: bp.color }}
                  />
                  <div
                    className="absolute -top-6 -translate-x-1/2 text-xs font-mono font-medium"
                    style={{ color: bp.color }}
                  >
                    {bp.name}
                  </div>
                  <div className="absolute -bottom-5 -translate-x-1/2 text-xs text-gray-400">
                    {bp.minWidth}
                  </div>
                </div>
              );
            })}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 text-xs text-gray-400">
              320px
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {breakpoints.map((bp) => (
            <BreakpointItem key={bp.name} {...bp} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Common Patterns</h4>
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div key={pattern.name} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4 py-2">
              <div className="md:w-1/3">
                <span className="text-sm font-medium">{pattern.name}</span>
                <p className="text-xs text-gray-500">{pattern.description}</p>
              </div>
              <code className="text-xs bg-gray-100 px-3 py-2 rounded font-mono text-gray-700 md:flex-1">
                {pattern.code}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

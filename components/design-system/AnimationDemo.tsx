'use client';

import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimationItemProps {
  name: string;
  token: string;
  duration: string;
  description: string;
  className: string;
}

function AnimationItem({ name, token, duration, description, className }: AnimationItemProps) {
  const [key, setKey] = useState(0);

  const replay = () => setKey((k) => k + 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-sm">{name}</h4>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
            {token}
          </code>
        </div>
        <Button variant="ghost" size="icon" onClick={replay} title="Replay animation">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-24 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
        <div
          key={key}
          className={cn("w-16 h-16 bg-primary rounded-lg", className)}
        />
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 font-mono">{duration}</p>
      </div>
    </div>
  );
}

export function AnimationDemo() {
  const animations = [
    {
      name: 'Fade In',
      token: 'animate-fade-in',
      duration: '600ms ease-out',
      description: 'Fade in with upward movement. Use for page sections, cards appearing.',
      className: 'animate-fade-in',
    },
    {
      name: 'Slide Up',
      token: 'animate-slide-up',
      duration: '600ms ease-out',
      description: 'Slide up with more pronounced movement. Use for modals, drawers.',
      className: 'animate-slide-up',
    },
  ];

  const timingGuidelines = [
    { duration: '150-200ms', usage: 'Micro-interactions', examples: 'Button hover, focus rings, color changes' },
    { duration: '300-400ms', usage: 'Transitions', examples: 'Accordion, drawer, tab switch' },
    { duration: '500-600ms', usage: 'Entrance animations', examples: 'Page load, section reveal' },
  ];

  const easingGuidelines = [
    { easing: 'ease-out', usage: 'Elements entering', description: 'Fast start, slow end. Natural arrival.' },
    { easing: 'ease-in-out', usage: 'State changes', description: 'Smooth throughout. Hover states, toggles.' },
    { easing: 'ease-in', usage: 'Elements exiting', description: 'Slow start, fast end. Natural departure.' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {animations.map((animation) => (
          <AnimationItem key={animation.token} {...animation} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Timing Guidelines</h4>
        <div className="space-y-3">
          {timingGuidelines.map((item) => (
            <div key={item.duration} className="flex items-start gap-4">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 w-24 shrink-0">
                {item.duration}
              </code>
              <div>
                <span className="text-sm font-medium">{item.usage}</span>
                <p className="text-xs text-gray-500">{item.examples}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold mb-4">Easing Functions</h4>
        <div className="space-y-3">
          {easingGuidelines.map((item) => (
            <div key={item.easing} className="flex items-start gap-4">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 w-24 shrink-0">
                {item.easing}
              </code>
              <div>
                <span className="text-sm font-medium">{item.usage}</span>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

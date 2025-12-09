'use client';

import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const animations = [
  { 
    name: 'fade-in', 
    class: 'animate-fade-in',
    duration: '0.6s',
    description: 'Fade in with slight upward movement',
    keyframes: `0% { opacity: 0; transform: translateY(20px); }
100% { opacity: 1; transform: translateY(0); }`
  },
  { 
    name: 'slide-up', 
    class: 'animate-slide-up',
    duration: '0.6s',
    description: 'Slide up from below with fade',
    keyframes: `0% { opacity: 0; transform: translateY(30px); }
100% { opacity: 1; transform: translateY(0); }`
  },
];

const transitions = [
  { name: 'Fast', duration: '150ms', class: 'duration-150' },
  { name: 'Normal', duration: '200ms', class: 'duration-200' },
  { name: 'Slow', duration: '300ms', class: 'duration-300' },
  { name: 'Custom', duration: '400ms', class: 'duration-400' },
];

export function AnimationDemo() {
  const [activeAnimation, setActiveAnimation] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const triggerAnimation = (animationClass: string) => {
    setActiveAnimation(null);
    setResetKey(prev => prev + 1);
    setTimeout(() => setActiveAnimation(animationClass), 50);
  };

  return (
    <div className="space-y-8">
      {/* Animation Demos */}
      <div>
        <h3 className="text-base font-medium mb-4">Entrance Animations</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {animations.map((anim) => (
            <div key={anim.name} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <code className="text-sm font-mono text-heiwaOrange-600">{anim.class}</code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => triggerAnimation(anim.class)}
                  className="h-8"
                >
                  <Play className="h-3 w-3 mr-1" /> Play
                </Button>
              </div>
              <div className="p-6 bg-gray-100 min-h-[120px] flex items-center justify-center">
                <div 
                  key={`${anim.name}-${resetKey}`}
                  className={`w-20 h-20 bg-gradient-to-br from-heiwaOrange-400 to-heiwaOrange-600 rounded-lg shadow-lg ${activeAnimation === anim.class ? anim.class : 'opacity-0'}`}
                />
              </div>
              <div className="px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">{anim.description}</p>
                <p className="text-xs text-gray-400 mt-1">Duration: {anim.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transition Durations */}
      <div>
        <h3 className="text-base font-medium mb-4">Transition Durations</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-wrap gap-6">
            {transitions.map((t) => (
              <div key={t.name} className="text-center">
                <div 
                  className={`w-16 h-16 bg-heiwaOrange-500 rounded-lg mb-2 hover:bg-heiwaOrange-600 hover:scale-110 transition-all ${t.class} cursor-pointer`}
                />
                <p className="text-sm font-medium text-gray-700">{t.name}</p>
                <code className="text-xs font-mono text-gray-400">{t.duration}</code>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">Hover the boxes to see transition speed differences.</p>
        </div>
      </div>

      {/* Spinner */}
      <div>
        <h3 className="text-base font-medium mb-4">Loading Spinner</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-heiwaOrange-200 border-t-heiwaOrange-500 rounded-full animate-spin mx-auto mb-2" />
              <code className="text-xs font-mono text-gray-500">animate-spin</code>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-heiwaOrange-500 rounded-full animate-spin mx-auto mb-2" />
              <span className="text-xs text-gray-500">Custom spinner</span>
            </div>
            <div className="text-center">
              <div className="flex gap-1 mx-auto mb-2 justify-center">
                <div className="w-2 h-2 bg-heiwaOrange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-heiwaOrange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-heiwaOrange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-gray-500">Dots loader</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reduced Motion */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-800 mb-2">Accessibility Note</h4>
        <p className="text-sm text-amber-700">
          All animations respect <code className="bg-amber-100 px-1 rounded">prefers-reduced-motion</code>. 
          Users who prefer reduced motion will see static or minimal animations.
        </p>
      </div>
    </div>
  );
}

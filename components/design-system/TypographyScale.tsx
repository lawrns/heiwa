import React from 'react';
import { cn } from "@/lib/utils";

interface TypographyItemProps {
  element: React.ElementType;
  className?: string;
  usage: string;
  children: React.ReactNode;
}

function TypographyItem({ element: Component, className, usage, children }: TypographyItemProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-baseline gap-4 py-6 border-b border-gray-100 last:border-0">
      <div className="md:w-1/4 shrink-0">
        <span className="text-sm font-medium text-gray-500 block mb-1">{usage}</span>
        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">
          {className?.split(' ').filter(c => c.startsWith('text-') || c.startsWith('font-')).join(' ')}
        </code>
      </div>
      <div className="md:w-3/4">
        <Component className={className}>{children}</Component>
      </div>
    </div>
  );
}

export function TypographyScale() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-6">
      <TypographyItem element="h1" className="text-7xl font-bold font-heading" usage="H1 Hero (Display)">
        The Surf Experience
      </TypographyItem>
      <TypographyItem element="h1" className="text-5xl font-bold font-heading" usage="H1 Page Title">
        Welcome to Heiwa House
      </TypographyItem>
      <TypographyItem element="h2" className="text-4xl font-bold font-heading" usage="H2 Section Header">
        Our Accommodations
      </TypographyItem>
      <TypographyItem element="h3" className="text-3xl font-semibold font-heading" usage="H3 Subsection">
        Private Ocean View Room
      </TypographyItem>
      <TypographyItem element="h4" className="text-2xl font-semibold font-heading" usage="H4 Card Title">
        Surf Coaching Package
      </TypographyItem>
      <TypographyItem element="h5" className="text-xl font-medium font-heading" usage="H5 Highlight">
        Available from October to April
      </TypographyItem>
      <TypographyItem element="h6" className="text-lg font-medium font-heading" usage="H6 Subhead">
        Includes breakfast and gear
      </TypographyItem>
      
      <div className="h-px bg-gray-200 my-4" />
      
      <TypographyItem element="p" className="text-lg leading-relaxed text-gray-700" usage="Body Large">
        Immerse yourself in the rhythm of the ocean. Our beachfront location offers direct access to some of the best breaks in the region, suitable for all skill levels.
      </TypographyItem>
      <TypographyItem element="p" className="text-base leading-relaxed text-gray-700" usage="Body Default">
        Located just steps from the sand, Heiwa House combines traditional Japanese aesthetics with modern coastal comfort. Each room is designed to provide a peaceful sanctuary after a day in the water.
      </TypographyItem>
      <TypographyItem element="p" className="text-sm leading-normal text-gray-600" usage="Body Small">
        *Prices subject to change during peak season. All bookings include complimentary breakfast and wifi access.
      </TypographyItem>
      <TypographyItem element="p" className="text-xs leading-normal text-gray-500 font-mono" usage="Monospace / Technical">
        ID: BK-2024-001 | REF: SURF-PKG-A
      </TypographyItem>
    </div>
  );
}



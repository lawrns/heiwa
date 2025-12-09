import React from 'react';
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ id, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("py-12 border-b border-gray-200 last:border-0 scroll-mt-20", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center group">
          <a href={`#${id}`} className="hover:text-primary transition-colors">
            {title}
            <span className="ml-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity select-none">#</span>
          </a>
        </h2>
        {description && <p className="text-lg text-gray-600 max-w-3xl">{description}</p>}
      </div>
      <div className="space-y-8">
        {children}
      </div>
    </section>
  );
}


import React from 'react';
import { cn } from "@/lib/utils";

interface ComponentShowcaseProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  grid?: boolean;
  cols?: 1 | 2 | 3 | 4;
}

export function ComponentShowcase({ 
  title, 
  description, 
  children, 
  className,
  grid = false,
  cols = 1
}: ComponentShowcaseProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white", className)}>
      {(title || description) && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className={cn(
        "p-6",
        grid && "grid gap-6",
        grid && gridClasses[cols]
      )}>
        {children}
      </div>
    </div>
  );
}


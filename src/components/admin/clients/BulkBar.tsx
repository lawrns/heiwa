'use client';

import { Button } from '@/components/ui/button';
import { Archive, Trash2, Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BulkBarProps {
  selectedCount: number;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
  onClearSelection: () => void;
  isArchiving?: boolean;
  isDeleting?: boolean;
  isExporting?: boolean;
  className?: string;
}

export function BulkBar({
  selectedCount,
  onArchiveSelected,
  onDeleteSelected,
  onExportSelected,
  onClearSelection,
  isArchiving = false,
  isDeleting = false,
  isExporting = false,
  className,
}: BulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      'flex items-center justify-between p-4 bg-heiwaOrange-50 border-b border-heiwaOrange-200',
      className
    )}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-heiwaOrange-900">
          {selectedCount} client{selectedCount !== 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onArchiveSelected}
            disabled={isArchiving}
            className="flex items-center gap-2 border-heiwaOrange-300 text-heiwaOrange-700 hover:bg-heiwaOrange-100"
          >
            <Archive className="h-4 w-4" />
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportSelected}
            disabled={isExporting}
            className="flex items-center gap-2 border-heiwaOrange-300 text-heiwaOrange-700 hover:bg-heiwaOrange-100"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            disabled={isDeleting}
            className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="flex items-center gap-2 text-heiwaOrange-700 hover:bg-heiwaOrange-100"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
        Clear
      </Button>
    </div>
  );
}

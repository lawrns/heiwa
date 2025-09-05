import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BrandBadgeProps {
  brand: 'Heiwa House' | 'Freedom Routes';
  className?: string;
}

const brandStyles = {
  'Heiwa House': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'Freedom Routes': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
} as const;

export function BrandBadge({ brand, className }: BrandBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium px-2 py-1 text-xs',
        brandStyles[brand],
        className
      )}
    >
      {brand}
    </Badge>
  );
}

// Status badge component (reused for status display)
interface StatusBadgeProps {
  status: 'Active' | 'Inactive';
  className?: string;
}

const statusStyles = {
  'Active': 'bg-green-100 text-green-700 hover:bg-green-200',
  'Inactive': 'bg-gray-100 text-gray-600 hover:bg-gray-200',
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-medium px-2 py-1 text-xs',
        statusStyles[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}

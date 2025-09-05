import { Button } from '@/components/ui/button';
import { Users, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = Users,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="rounded-full bg-gray-100 p-3 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-500 mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function NoClientsState({ onAddClient }: { onAddClient: () => void }) {
  return (
    <EmptyState
      title="No clients yet"
      description="Get started by adding your first client to the system."
      action={{
        label: 'Add First Client',
        onClick: onAddClient,
        icon: Plus,
      }}
    />
  );
}

export function NoSearchResultsState({
  searchTerm,
  onClearSearch
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No clients found"
      description={`No clients match "${searchTerm}". Try adjusting your search or filters.`}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  );
}

export function LoadingState({ message = 'Loading clients...' }: { message?: string }) {
  return (
    <EmptyState
      icon={() => (
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600" />
      )}
      title=""
      description={message}
    />
  );
}

import { ReactNode } from 'react';
import { Inbox, AlertCircle, Search, FileX, Users, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'error' | 'users' | 'file';
}

const VARIANT_ICONS: Record<NonNullable<EmptyStateProps['variant']>, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  users: Users,
  file: FileX,
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const Icon = icon || VARIANT_ICONS[variant];
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-4">
        <Icon className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-md mb-4">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

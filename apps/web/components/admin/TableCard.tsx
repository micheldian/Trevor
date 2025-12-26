import { ReactNode } from 'react';

interface TableCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Table Card
 *
 * Card wrapper for tables with:
 * - Title and optional description
 * - Optional action buttons
 * - Responsive table container
 */
export function TableCard({ title, description, actions, children }: TableCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

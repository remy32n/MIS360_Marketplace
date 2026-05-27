import React from 'react';
import { Badge } from '../ui/badge';

interface ListingBadgeProps {
  status: string;
  className?: string;
}

export function ListingBadge({ status, className = '' }: ListingBadgeProps) {
  const getBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700';
      case 'REMOVED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getBadgeVariant(status)} ${className}`}>
      {status.toUpperCase()}
    </Badge>
  );
}

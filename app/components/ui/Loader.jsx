import React from 'react';

import { cn } from '@/lib/utils';

export const Loader = ({ className }) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center py-16',
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/25 border-t-primary animate-spin" />
    </div>
  );
};

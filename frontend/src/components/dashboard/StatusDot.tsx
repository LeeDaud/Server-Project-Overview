import * as React from 'react';
import { cn } from '@/components/ui/utils';
import type { ProjectStatus } from '@/types/project';

const STATUS_CONFIG: Record<ProjectStatus, { color: string; label: string }> = {
  online:  { color: 'bg-success',     label: 'Online' },
  offline: { color: 'bg-destructive', label: 'Offline' },
  unknown: { color: 'bg-warning',     label: 'Unknown' },
};

interface StatusDotProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      data-slot="status-dot"
      aria-label={cfg.label}
      className={cn('inline-block size-2 rounded-full shrink-0', cfg.color, className)}
    />
  );
}

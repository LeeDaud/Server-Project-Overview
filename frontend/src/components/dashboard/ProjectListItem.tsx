import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';
import { StatusDot } from './StatusDot';
import type { Project } from '@/types/project';

interface ProjectListItemProps {
  project: Project;
  className?: string;
}

const STATUS_BADGE: Record<string, string> = {
  online:  'border-success/30 text-success bg-success/8',
  offline: 'border-destructive/30 text-destructive bg-destructive/8',
  unknown: 'border-warning/30 text-warning bg-warning/8',
};

export function ProjectListItem({ project, className }: ProjectListItemProps) {
  const badgeCls = STATUS_BADGE[project.status] ?? STATUS_BADGE.unknown;
  const url = project.primaryDomain ? `https://${project.primaryDomain}` : project.healthCheckUrl;

  return (
    <div
      data-slot="project-list-item"
      className={cn(
        'flex items-center justify-between gap-3 py-4',
        'border-b border-border last:border-0',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <StatusDot status={project.status} />
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-text-primary leading-snug truncate">
            {project.name}
          </p>
          {project.primaryDomain && (
            <p className="text-[12px] text-text-tertiary truncate mt-0.5">
              {project.primaryDomain}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {project.port && (
          <Badge variant="outline" className="text-[11px] text-text-tertiary">
            :{project.port}
          </Badge>
        )}
        <Badge className={cn('text-[11px] border', badgeCls)}>
          {project.status === 'online' ? 'Online' : project.status === 'offline' ? 'Offline' : 'Unknown'}
        </Badge>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="size-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-brand hover:bg-brand/8 transition-colors"
            aria-label={`Open ${project.name}`}
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

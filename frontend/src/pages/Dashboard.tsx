import * as React from 'react';
import {
  Server, CheckCircle, XCircle, LayoutGrid, RefreshCw,
  Database, Globe, Activity, Terminal, GitBranch, Clock,
} from 'lucide-react';
import { TopBar, TopBarAction } from '@/components/patterns/top-bar';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/components/ui/utils';
import type { Project } from '@/types/project';

function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  if (d.getTime() === 0) return '—';
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return d.toLocaleTimeString();
}

const INFRA = [
  { name: 'Nginx', role: 'Reverse proxy & static hosting', icon: Globe },
  { name: 'MariaDB', role: 'Database (LeeDaud Website)', icon: Database },
  { name: 'Redis', role: 'Cache & sessions', icon: Database },
];

const STATUS_COLORS: Record<string, { dot: string; badge: string; bg: string }> = {
  online:  { dot: 'bg-success', badge: 'text-success border-success/30 bg-success/8', bg: 'bg-success/5' },
  offline: { dot: 'bg-destructive', badge: 'text-destructive border-destructive/30 bg-destructive/8', bg: 'bg-destructive/5' },
  unknown: { dot: 'bg-warning', badge: 'text-warning border-warning/30 bg-warning/8', bg: 'bg-warning/5' },
};

function StatusDot({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.unknown;
  return (
    <span className="relative flex size-2.5 shrink-0">
      {status === 'online' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-50" />
      )}
      <span className={cn('relative inline-flex rounded-full size-2.5', c.dot)} />
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const c = STATUS_COLORS[project.status] ?? STATUS_COLORS.unknown;
  const url = project.primaryDomain ? `https://${project.primaryDomain}` : project.healthCheckUrl;
  const statusLabel = project.status === 'online' ? 'Online' : project.status === 'offline' ? 'Offline' : 'Unknown';

  return (
    <div className={cn('rounded-2xl bg-card shadow-[var(--shadow-card)] p-5 flex flex-col gap-4', c.bg)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <StatusDot status={project.status} />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-text-primary leading-snug truncate">{project.name}</p>
            {project.primaryDomain && (
              <a
                href={url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-brand hover:underline truncate block mt-0.5"
              >
                {project.primaryDomain}
              </a>
            )}
          </div>
        </div>
        <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0', c.badge)}>
          {statusLabel}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2">
        {project.port && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2">
            <Server className="size-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Port</p>
              <p className="text-[13px] font-bold text-text-primary">:{project.port}</p>
            </div>
          </div>
        )}
        {project.serviceName && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2">
            <Terminal className="size-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Service</p>
              <p className="text-[13px] font-bold text-text-primary truncate">{project.serviceName}</p>
            </div>
          </div>
        )}
        {project.repoPath && (
          <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2">
            <GitBranch className="size-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Repo</p>
              <p className="text-[13px] font-bold text-text-primary truncate">{project.repoPath.split('/').pop()}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2">
          <Clock className="size-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wide">Checked</p>
            <p className="text-[13px] font-bold text-text-primary">{formatCheckedAt(project.statusCheckedAt)}</p>
          </div>
        </div>
      </div>

      {/* Domains list if multiple */}
      {project.domains.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {project.domains.map((d) => (
            <span key={d} className="text-[11px] text-text-tertiary bg-surface-subtle px-2 py-0.5 rounded-md">
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { data, loading, error, refresh, refreshing } = useProjects();

  const lastChecked = React.useMemo(() => {
    if (!data?.projects.length) return '—';
    const latest = data.projects.reduce((acc, p) => {
      const t = new Date(p.statusCheckedAt).getTime();
      return t > acc ? t : acc;
    }, 0);
    return formatCheckedAt(new Date(latest).toISOString());
  }, [data]);

  const totalProjects = data?.projects.length ?? 0;
  const totalProcesses = data?.projects.filter(p => p.serviceName).length ?? 0;

  return (
    <div className="min-h-screen bg-surface-page">
      <TopBar
        logo={
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Server className="size-[18px] text-brand" strokeWidth={2} />
            </div>
            <span className="text-[18px] font-bold text-text-primary">Dashboard</span>
          </div>
        }
        subtitle={`licheng.website · Last checked ${lastChecked}`}
        className="px-8 border-b border-border"
        actions={
          <TopBarAction onClick={refresh} disabled={refreshing} aria-label="Refresh">
            <RefreshCw
              className={cn('size-[18px] text-text-secondary', refreshing && 'animate-spin')}
              strokeWidth={2}
            />
          </TopBarAction>
        }
      />

      <div className="flex h-[calc(100vh-89px)]">
        {/* Left sidebar — stats */}
        <aside className="w-72 shrink-0 border-r border-border overflow-y-auto p-6 flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl bg-destructive/8 border border-destructive/20 p-4">
              <p className="text-[13px] text-destructive font-medium">Failed to load: {error}</p>
            </div>
          )}

          {/* Summary stats */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-widest font-semibold mb-3">Overview</p>
            <div className="space-y-2">
              <StatRow icon={Activity} label="Services Online" value={`${data?.totalOnline ?? 0} / ${totalProjects}`} loading={loading} />
              <StatRow icon={LayoutGrid} label="Total Projects" value={totalProjects} loading={loading} />
              <StatRow icon={Terminal} label="Total Processes" value={totalProcesses} loading={loading} />
              <StatRow icon={CheckCircle} label="Online" value={data?.totalOnline ?? 0} loading={loading} color="text-success" />
              <StatRow icon={XCircle} label="Offline" value={data?.totalOffline ?? 0} loading={loading} color="text-destructive" />
              <StatRow icon={Activity} label="Unknown" value={data?.totalUnknown ?? 0} loading={loading} color="text-warning" />
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <p className="text-[11px] text-text-tertiary uppercase tracking-widest font-semibold mb-3">Infrastructure</p>
            <div className="space-y-2">
              {INFRA.map((svc) => (
                <div key={svc.name} className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-card)]">
                  <div className="size-7 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
                    <svc.icon className="size-3.5 text-text-tertiary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-text-primary">{svc.name}</p>
                    <p className="text-[11px] text-text-tertiary truncate">{svc.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content — project cards */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-text-primary">Business Projects</h2>
            <span className="text-[13px] text-text-tertiary">{totalProjects} projects · {totalProcesses} processes</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-card animate-pulse" />
              ))}
            </div>
          ) : data?.projects.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-[14px] text-text-tertiary">No projects found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  loading,
  color = 'text-text-primary',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  loading: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-card px-3 py-2.5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
        <span className="text-[13px] text-text-secondary">{label}</span>
      </div>
      {loading ? (
        <div className="h-4 w-8 rounded bg-surface-subtle animate-pulse" />
      ) : (
        <span className={cn('text-[14px] font-bold', color)}>{value}</span>
      )}
    </div>
  );
}

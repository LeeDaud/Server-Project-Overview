import * as React from 'react';
import {
  Server, CheckCircle, XCircle, LayoutGrid, RefreshCw,
  Database, Globe, Activity,
} from 'lucide-react';
import { PageShell, PageContent } from '@/components/patterns/page-shell';
import { TopBar, TopBarAction } from '@/components/patterns/top-bar';
import { HeroCard } from '@/components/patterns/hero-card';
import { StatCard } from '@/components/patterns/stat-card';
import { SectionCard } from '@/components/patterns/section-card';
import { ProjectListItem } from '@/components/dashboard/ProjectListItem';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/components/ui/utils';

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

  return (
    <PageShell maxWidth="480px">
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
        actions={
          <TopBarAction
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn('size-[18px] text-text-secondary', refreshing && 'animate-spin')}
              strokeWidth={2}
            />
          </TopBarAction>
        }
      />

      <PageContent>
        {/* Error state */}
        {error && (
          <div className="mx-6 rounded-2xl bg-destructive/8 border border-destructive/20 p-5">
            <p className="text-[13px] text-destructive font-medium">
              Failed to load: {error}
            </p>
          </div>
        )}

        {/* Section D: Hero */}
        {loading ? (
          <div className="mx-6 h-[140px] rounded-2xl bg-card animate-pulse" />
        ) : (
          <HeroCard
            icon={Server}
            label="Services Online"
            value={data?.totalOnline ?? 0}
            unit={` / ${data?.projects.length ?? 0}`}
            watermarkIcon={Activity}
          />
        )}

        {/* Section B: KPI Grid */}
        <div className="px-6 grid grid-cols-2 gap-3">
          {loading ? (
            <>
              <div className="h-[110px] rounded-2xl bg-card animate-pulse" />
              <div className="h-[110px] rounded-2xl bg-card animate-pulse" />
              <div className="h-[110px] rounded-2xl bg-card animate-pulse" />
              <div className="h-[110px] rounded-2xl bg-card animate-pulse" />
            </>
          ) : (
            <>
              <StatCard icon={CheckCircle} label="Online" value={data?.totalOnline ?? 0} />
              <StatCard icon={XCircle} label="Offline" value={data?.totalOffline ?? 0} />
              <StatCard icon={LayoutGrid} label="Total" value={data?.projects.length ?? 0} />
              <StatCard icon={Activity} label="Unknown" value={data?.totalUnknown ?? 0} />
            </>
          )}
        </div>

        {/* Section A: Business Projects */}
        <SectionCard title="Business Projects">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-surface-subtle animate-pulse" />
              ))}
            </div>
          ) : data?.projects.length ? (
            <div>
              {data.projects.map((p) => (
                <ProjectListItem key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-tertiary py-4 text-center">
              No projects found
            </p>
          )}
        </SectionCard>

        {/* Section A: Infrastructure */}
        <SectionCard title="Infrastructure">
          <div>
            {INFRA.map((svc, i) => (
              <div
                key={svc.name}
                className={cn(
                  'flex items-center gap-3 py-4',
                  i < INFRA.length - 1 && 'border-b border-border',
                )}
              >
                <div className="size-8 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0">
                  <svc.icon className="size-4 text-text-tertiary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-primary">{svc.name}</p>
                  <p className="text-[12px] text-text-tertiary mt-0.5">{svc.role}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </PageContent>
    </PageShell>
  );
}

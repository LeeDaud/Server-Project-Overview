import type { Project, ProjectStatus } from '../types/project.js';

interface StatusEntry {
  status: ProjectStatus;
  checkedAt: string;
}

const cache = new Map<string, StatusEntry>();
let timer: ReturnType<typeof setInterval> | null = null;
let projectsRef: Project[] = [];

async function checkOne(url: string): Promise<ProjectStatus> {
  if (!url) return 'unknown';
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeout);
    // 2xx / 3xx / 401 → online
    if (res.status < 500) return 'online';
    return 'offline';
  } catch {
    return 'offline';
  }
}

async function checkAll(): Promise<void> {
  const results = await Promise.allSettled(
    projectsRef.map(async (p) => {
      const status = await checkOne(p.healthCheckUrl);
      cache.set(p.id, { status, checkedAt: new Date().toISOString() });
    })
  );
  // log failures silently
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Health check failed for ${projectsRef[i]?.id}:`, r.reason);
    }
  });
}

export function startHealthChecker(
  projects: Project[],
  intervalMs = 60_000
): void {
  projectsRef = projects;
  // 立即执行一次
  checkAll().catch(console.error);
  if (timer) clearInterval(timer);
  timer = setInterval(() => checkAll().catch(console.error), intervalMs);
}

export function updateProjects(projects: Project[]): void {
  projectsRef = projects;
  checkAll().catch(console.error);
}

export function getStatus(projectId: string): StatusEntry {
  return cache.get(projectId) ?? { status: 'unknown', checkedAt: new Date(0).toISOString() };
}

export function applyStatuses(projects: Project[]): Project[] {
  return projects.map((p) => {
    const entry = getStatus(p.id);
    return { ...p, status: entry.status, statusCheckedAt: entry.checkedAt };
  });
}

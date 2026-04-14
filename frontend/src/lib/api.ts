import type { DashboardData } from '@/types/project';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${BASE}/projects`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json() as { ok: boolean; data: DashboardData };
  if (!json.ok) throw new Error('API returned ok=false');
  return json.data;
}

export async function refreshDashboard(): Promise<DashboardData> {
  const res = await fetch(`${BASE}/projects/refresh`, { method: 'POST' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json() as { ok: boolean; data: DashboardData };
  if (!json.ok) throw new Error('API returned ok=false');
  return json.data;
}

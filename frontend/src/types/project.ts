export type ProjectStatus = 'online' | 'offline' | 'unknown';

export interface Project {
  id: string;
  name: string;
  domains: string[];
  primaryDomain: string;
  port: number | null;
  serviceName: string;
  repoPath: string;
  gitRemote?: string;
  updateCommand: string;
  logCommand: string;
  healthCheckUrl: string;
  status: ProjectStatus;
  statusCheckedAt: string;
}

export interface DashboardData {
  projects: Project[];
  parsedAt: string;
  totalOnline: number;
  totalOffline: number;
  totalUnknown: number;
}

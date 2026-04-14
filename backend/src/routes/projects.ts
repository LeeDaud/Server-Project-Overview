import { Router } from 'express';
import { parseProjectsFromMd } from '../services/parser.js';
import { applyStatuses, updateProjects } from '../services/healthChecker.js';
import type { DashboardData } from '../types/project.js';

const router = Router();
const MD_FILE_PATH = process.env.MD_FILE_PATH ?? '';

function buildDashboard(): DashboardData {
  const raw = parseProjectsFromMd(MD_FILE_PATH);
  const projects = applyStatuses(raw);
  return {
    projects,
    parsedAt: new Date().toISOString(),
    totalOnline: projects.filter((p) => p.status === 'online').length,
    totalOffline: projects.filter((p) => p.status === 'offline').length,
    totalUnknown: projects.filter((p) => p.status === 'unknown').length,
  };
}

router.get('/', (_req, res) => {
  try {
    res.json({ ok: true, data: buildDashboard() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

router.post('/refresh', (_req, res) => {
  try {
    const raw = parseProjectsFromMd(MD_FILE_PATH);
    updateProjects(raw);
    const data = buildDashboard();
    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;

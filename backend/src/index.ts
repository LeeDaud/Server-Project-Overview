import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import projectsRouter from './routes/projects.js';
import { parseProjectsFromMd } from './services/parser.js';
import { startHealthChecker } from './services/healthChecker.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3013);
const MD_FILE_PATH = process.env.MD_FILE_PATH ?? '';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const HEALTH_CHECK_INTERVAL_MS = Number(process.env.HEALTH_CHECK_INTERVAL_MS ?? 60_000);

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/api/projects', projectsRouter);

app.listen(PORT, () => {
  console.log(`[dashboard-api] listening on port ${PORT}`);
  if (!MD_FILE_PATH) {
    console.warn('[dashboard-api] MD_FILE_PATH not set — set it in .env');
    return;
  }
  try {
    const projects = parseProjectsFromMd(MD_FILE_PATH);
    console.log(`[dashboard-api] parsed ${projects.length} projects from MD`);
    startHealthChecker(projects, HEALTH_CHECK_INTERVAL_MS);
  } catch (err) {
    console.error('[dashboard-api] failed to parse MD on startup:', err);
  }
});

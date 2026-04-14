# Project Dashboard

A self-hosted dashboard for monitoring all projects on `licheng.website`.

Reads `server-projects-overview.md` as the data source and performs HTTP health checks on each project every 60 seconds.

## Stack

- **Frontend**: React 18 + TypeScript + Vite 6 + Tailwind CSS v4 (StyleSeed linear skin)
- **Backend**: Node.js + Express + TypeScript

## Project Structure

```
013/
├── frontend/       # React SPA
├── backend/        # Express API (port 3013)
└── deploy/         # systemd, nginx, install/update scripts
```

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # set MD_FILE_PATH to local path of server-projects-overview.md
npm install
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, proxies API to `http://localhost:3013`.

## Deploy

```bash
bash deploy/scripts/install.sh
```

Deploys to `https://dashboard.licheng.website`.

## Update

```bash
bash deploy/scripts/update.sh
```

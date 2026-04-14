import { readFileSync } from 'fs';
import type { Project } from '../types/project.js';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractBacktickValue(line: string): string {
  const match = line.match(/`([^`]+)`/);
  return match ? match[1].trim() : '';
}

function extractAllBacktickValues(line: string): string[] {
  const matches = [...line.matchAll(/`([^`]+)`/g)];
  return matches.map(m => m[1].trim());
}

function extractHealthCheckUrl(lines: string[], domains: string[]): string {
  // 优先从验证结果行提取 curl -I https://... 的 URL
  for (const line of lines) {
    if (line.includes('验证结果') && line.includes('curl -I https://')) {
      const match = line.match(/curl -I (https:\/\/[^\s`]+)/);
      if (match) return match[1].replace(/`$/, '');
    }
  }
  // 其次从 curl http://127.0.0.1:PORT/health 提取（内部健康检查）
  for (const line of lines) {
    if (line.includes('验证结果') && line.includes('curl http://127.0.0.1')) {
      const match = line.match(/curl (http:\/\/127\.0\.0\.1:[^\s`]+)/);
      if (match) return match[1].replace(/`$/, '');
    }
  }
  // 最后用主域名构造
  if (domains.length > 0) {
    return `https://${domains[0]}/`;
  }
  return '';
}

export function parseProjectsFromMd(filePath: string): Project[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // 找到 "## 3. Business Project Details" 和 "## 4." 之间的内容
  // 以及 "## 9." 这样的额外项目 section
  const projects: Project[] = [];

  // 收集所有 ### 开头的 section（项目详情块）
  // 策略：找到 ## 3. 之后的所有 ### 子节，直到下一个 ## 节
  let inDetailSection = false;
  let currentSectionLines: string[] = [];
  let currentSectionTitle = '';

  const flushSection = () => {
    if (currentSectionLines.length === 0) return;
    const project = parseSingleProjectSection(currentSectionTitle, currentSectionLines);
    if (project) projects.push(project);
    currentSectionLines = [];
    currentSectionTitle = '';
  };

  for (const line of lines) {
    // 进入 ## 3. Business Project Details
    if (line.startsWith('## 3.')) {
      inDetailSection = true;
      continue;
    }
    // 进入 ## 9. proxy-fleet（额外项目 section）
    if (line.startsWith('## 9.')) {
      inDetailSection = true;
      // 把 ## 9. 当作一个 ### 节处理
      flushSection();
      currentSectionTitle = line.replace(/^##\s*\d+\.\s*/, '').trim();
      continue;
    }
    // 遇到其他 ## 节，退出
    if (line.startsWith('## ') && !line.startsWith('## 3.') && !line.startsWith('## 9.')) {
      if (inDetailSection) {
        flushSection();
        inDetailSection = false;
      }
      continue;
    }

    if (!inDetailSection) continue;

    // ### 子节开始
    if (line.startsWith('### ')) {
      flushSection();
      currentSectionTitle = line.replace(/^###\s*[\d.]+\s*/, '').trim();
      continue;
    }

    currentSectionLines.push(line);
  }
  flushSection();

  return projects;
}

function parseSingleProjectSection(title: string, lines: string[]): Project | null {
  if (lines.length === 0) return null;

  const get = (key: string): string => {
    for (const line of lines) {
      if (line.startsWith(key + '：') || line.startsWith(key + ':')) {
        return extractBacktickValue(line);
      }
    }
    return '';
  };

  const getAll = (key: string): string[] => {
    const results: string[] = [];
    for (const line of lines) {
      if (line.startsWith(key + '：') || line.startsWith(key + ':')) {
        results.push(...extractAllBacktickValues(line));
      }
    }
    return results;
  };

  const name = get('项目名称') || title;
  if (!name) return null;

  const domains = getAll('公开域名');
  const primaryDomain = domains[0] ?? '';

  const portStr = get('本地端口') || get('代理端口') || get('面板端口');
  const port = portStr ? parseInt(portStr, 10) : null;

  const serviceName = get('服务名称') || get('面板服务') || get('服务模板') || '';
  const repoPath = get('仓库路径') || '';
  const gitRemote = get('Git 远程') || undefined;

  // 更新命令取第一个
  const updateCommand = get('更新命令');
  // 日志命令取第一个
  const logCommand = get('日志命令');

  const healthCheckUrl = extractHealthCheckUrl(lines, domains);

  return {
    id: slugify(name),
    name,
    domains,
    primaryDomain,
    port,
    serviceName,
    repoPath,
    gitRemote,
    updateCommand,
    logCommand,
    healthCheckUrl,
    status: 'unknown',
    statusCheckedAt: new Date(0).toISOString(),
  };
}

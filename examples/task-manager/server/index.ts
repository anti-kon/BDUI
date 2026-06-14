import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..', '..');
const publicDir = path.resolve(projectRoot, 'public');

interface ProfileBody {
  readonly name?: unknown;
  readonly email?: unknown;
  readonly workspace?: unknown;
  readonly plan?: unknown;
}

interface TaskBody {
  readonly title?: unknown;
  readonly workspace?: unknown;
}

interface SettingsBody {
  readonly theme?: unknown;
  readonly notifications?: unknown;
  readonly compact?: unknown;
  readonly plan?: unknown;
}

interface RequestBody {
  readonly type?: unknown;
  readonly priority?: unknown;
  readonly summary?: unknown;
  readonly impact?: unknown;
  readonly budget?: unknown;
  readonly design?: unknown;
  readonly legal?: unknown;
}

const profiles = new Map<
  string,
  { name: string; email: string; workspace: string; plan: string; updatedAt: string }
>();
const tasks: { id: string; title: string; workspace: string; createdAt: string }[] = [];
const requests: Array<{
  id: string;
  type: string;
  priority: string;
  summary: string;
  impact: string;
  budget: number;
  owner: string;
  eta: string;
  createdAt: string;
}> = [];
const settings = new Map<
  string,
  { theme: string; notifications: boolean; compact: boolean; plan: string; updatedAt: string }
>();

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function boolValue(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return Boolean(value);
}

function numberValue(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function shortId(prefix: string): string {
  const hash = createHash('sha1').update(randomUUID()).digest('hex').slice(0, 6).toUpperCase();
  return `${prefix}-${hash}`;
}

function planSnapshot(plan: string) {
  const now = new Date().toISOString();
  const normalizedPlan = plan || 'scale';
  if (normalizedPlan === 'enterprise') {
    return {
      health: 'Excellent',
      utilization: 88,
      risk: 'Low',
      revenue: '$2.4M',
      sla: '99.98%',
      nextReview: 'Today 16:30',
      updatedAt: now,
      activeProjects: 18,
      blockerCount: 1,
    };
  }
  if (normalizedPlan === 'starter') {
    return {
      health: 'Stable',
      utilization: 61,
      risk: 'Medium',
      revenue: '$180K',
      sla: '99.5%',
      nextReview: 'Tomorrow 10:00',
      updatedAt: now,
      activeProjects: 5,
      blockerCount: 3,
    };
  }
  return {
    health: 'Operational',
    utilization: 76,
    risk: 'Managed',
    revenue: '$820K',
    sla: '99.9%',
    nextReview: 'Today 14:00',
    updatedAt: now,
    activeProjects: 11,
    blockerCount: 2,
  };
}

async function start(): Promise<void> {
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? '0.0.0.0';
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    index: 'index.html',
    etag: true,
    cacheControl: false,
  });

  app.get('/healthz', async () => ({ ok: true }));

  app.get<{ Querystring: { plan?: string } }>('/api/workspace', async (request) => {
    return planSnapshot(request.query.plan ?? 'scale');
  });

  app.post<{ Body: ProfileBody }>('/api/profile', async (request, reply) => {
    const body = (request.body ?? {}) as ProfileBody;
    const name = stringValue(body.name);
    const email = stringValue(body.email);
    const workspace = stringValue(body.workspace, 'Taskly Ops');
    const plan = stringValue(body.plan, 'scale');
    if (!name || !email) {
      return reply.code(400).send({ error: 'name and email are required' });
    }
    const key = email.toLowerCase();
    const record = { name, email, workspace, plan, updatedAt: new Date().toISOString() };
    profiles.set(key, record);
    return record.updatedAt;
  });

  app.post<{ Body: TaskBody }>('/api/task', async (request, reply) => {
    const body = (request.body ?? {}) as TaskBody;
    const title = stringValue(body.title);
    const workspace = stringValue(body.workspace, 'Taskly Ops');
    if (!title) {
      return reply.code(400).send({ error: 'title is required' });
    }
    const task = { id: randomUUID(), title, workspace, createdAt: new Date().toISOString() };
    tasks.push(task);
    return task.title;
  });

  app.post<{ Body: SettingsBody }>('/api/settings', async (request) => {
    const body = (request.body ?? {}) as SettingsBody;
    const theme = stringValue(body.theme, 'system');
    const notifications = boolValue(body.notifications);
    const compact = boolValue(body.compact);
    const plan = stringValue(body.plan, 'scale');
    const updatedAt = new Date().toISOString();
    settings.set('default', { theme, notifications, compact, plan, updatedAt });
    return updatedAt;
  });

  app.post<{ Body: RequestBody }>('/api/request', async (request, reply) => {
    const body = (request.body ?? {}) as RequestBody;
    const summary = stringValue(body.summary);
    const impact = stringValue(body.impact);
    if (summary.length < 12 || impact.length < 20) {
      return reply.code(400).send({ error: 'request summary and impact are required' });
    }
    const priority = stringValue(body.priority, 'Normal');
    const requestRecord = {
      id: shortId('REQ'),
      type: stringValue(body.type, 'Launch review'),
      priority,
      summary,
      impact,
      budget: numberValue(body.budget, 0),
      owner: priority === 'Urgent' ? 'Executive operations' : 'Launch desk',
      eta: priority === 'Urgent' ? '4 business hours' : '2 business days',
      createdAt: new Date().toISOString(),
    };
    requests.push(requestRecord);
    return {
      id: requestRecord.id,
      owner: requestRecord.owner,
      eta: requestRecord.eta,
    };
  });

  try {
    await app.listen({ port, host });
    app.log.info(`Taskly is up on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exitCode = 1;
  }
}

start().catch((error) => {
  console.error('Taskly failed to start:', error);
  process.exitCode = 1;
});

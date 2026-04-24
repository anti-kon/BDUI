import { randomUUID } from 'node:crypto';
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
}

interface TaskBody {
  readonly title?: unknown;
}

interface SettingsBody {
  readonly theme?: unknown;
  readonly notifications?: unknown;
}

const profiles = new Map<string, { name: string; email: string; updatedAt: string }>();
const tasks: { id: string; title: string; createdAt: string }[] = [];
const settings = new Map<string, { theme: string; notifications: boolean; updatedAt: string }>();

async function start(): Promise<void> {
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.HOST ?? '0.0.0.0';
  const app = Fastify({ logger: { level: 'info' } });

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    index: 'index.html',
    cacheControl: false,
  });

  app.get('/healthz', async () => ({ ok: true }));

  app.post<{ Body: ProfileBody }>('/api/profile', async (request, reply) => {
    const body = (request.body ?? {}) as ProfileBody;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!name || !email) {
      return reply.code(400).send({ error: 'name and email are required' });
    }
    const key = email.toLowerCase();
    const record = { name, email, updatedAt: new Date().toISOString() };
    profiles.set(key, record);
    return record;
  });

  app.post<{ Body: TaskBody }>('/api/task', async (request, reply) => {
    const body = (request.body ?? {}) as TaskBody;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return reply.code(400).send({ error: 'title is required' });
    }
    const task = { id: randomUUID(), title, createdAt: new Date().toISOString() };
    tasks.push(task);
    return task.title;
  });

  app.post<{ Body: SettingsBody }>('/api/settings', async (request) => {
    const body = (request.body ?? {}) as SettingsBody;
    const theme = typeof body.theme === 'string' ? body.theme : 'auto';
    const notifications = Boolean(body.notifications);
    const updatedAt = new Date().toISOString();
    settings.set('default', { theme, notifications, updatedAt });
    return updatedAt;
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

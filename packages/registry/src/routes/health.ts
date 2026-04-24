import type { FastifyInstance } from 'fastify';

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/v1/health', async () => ({ ok: true, name: 'bdui-registry' }));
}

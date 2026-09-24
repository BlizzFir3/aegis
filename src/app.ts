import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { ProxyService } from './modules/proxy/proxy.service';
import { RateLimitService } from './modules/rate-limit/rate-limit.service';

export const buildApp = async (): Promise<FastifyInstance> => {
  // On active la confiance aux proxies (utile si tu déploies sur un Cloud Provider qui masque l'IP réelle)
  const app = fastify({
    logger: env.NODE_ENV === 'development',
    trustProxy: true,
  });

  await app.register(cors, { origin: '*' });

  // 🛡️ Enregistrement du Rate Limiter
  await RateLimitService.register(app);

  app.get('/health', async () => {
    return { status: 'ok', uptime: process.uptime() };
  });

  // 🔌 Enregistrement de la route de Proxying
  await ProxyService.register(app, '/v1');

  return app;
};

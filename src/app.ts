import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { ProxyService } from './modules/proxy/proxy.service';
import { RateLimitService } from './modules/rate-limit/rate-limit.service';

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
    trustProxy: true,
  });

  await app.register(cors, { origin: '*' });

  await RateLimitService.register(app);

  app.get('/health', async () => {
    return { status: 'ok', uptime: process.uptime() };
  });

  await ProxyService.register(app, '/v1');

  return app;
};

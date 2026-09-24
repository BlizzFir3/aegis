import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';

// Factory function pour créer l'instance de l'app (facilite les tests unitaires plus tard)
export const buildApp = async (): Promise<FastifyInstance> => {
  const app = fastify({
    logger: env.NODE_ENV === 'development', // Active les logs natifs de Fastify en dev
  });

  // Enregistrement des plugins de base
  await app.register(cors, { origin: '*' });

  // Route de Healthcheck
  app.get('/health', async () => {
    return { status: 'ok', uptime: process.uptime() };
  });

  return app;
};

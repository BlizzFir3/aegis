import { buildApp } from './app';
import { env } from './config/env';
import { RedisClient } from './modules/cache/redis.client';

const startServer = async (): Promise<void> => {
  try {
    const app = await buildApp();

    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // eslint-disable-next-line no-console
    console.log(`Aegis Gateway démarré sur http://localhost:${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`Modèle cible : ${env.TARGET_MODEL}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erreur critique au démarrage:', err);
    process.exit(1);
  }
};

const shutdown = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('\nArrêt gracieux du serveur...');
  await RedisClient.getInstance().disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

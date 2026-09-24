import { buildApp } from './app';
import { env } from './config/env';
import { RedisClient } from './modules/cache/redis.client';

const startServer = async (): Promise<void> => {
  try {
    // 1. Initialisation de l'application
    const app = await buildApp();

    // 2. Démarrage du serveur
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // eslint-disable-next-line no-console
    console.log(`🚀 Aegis Gateway démarré sur http://localhost:${env.PORT}`);
    // eslint-disable-next-line no-console
    console.log(`🔗 Modèle cible : ${env.TARGET_MODEL}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Erreur critique au démarrage:', err);
    process.exit(1);
  }
};

// Gestion du Graceful Shutdown (pour fermer proprement Redis et Fastify si on coupe le terminal)
const shutdown = async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('\n🛑 Arrêt gracieux du serveur...');
  await RedisClient.getInstance().disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

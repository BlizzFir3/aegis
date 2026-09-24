import Redis from 'ioredis';
import { env } from '../../config/env';

export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  private constructor() {
    this.client = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      // Paramètres pro : on retente la connexion si elle est perdue
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.client.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('✅ Connecté à Redis avec succès');
    });

    this.client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('❌ Erreur de connexion Redis:', err.message);
    });
  }

  // Méthode statique pour récupérer l'instance unique
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  // Getter pour accéder directement à l'instance de ioredis
  public getClient(): Redis {
    return this.client;
  }

  // Méthode propre pour couper la connexion (utile pour le graceful shutdown)
  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Export d'une instance prête à l'emploi (facilite les imports dans les autres modules)
export const redisClient = RedisClient.getInstance().getClient();

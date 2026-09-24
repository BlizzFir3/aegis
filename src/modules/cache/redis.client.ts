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
      console.log('Connecté à Redis avec succès');
    });

    this.client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Erreur de connexion Redis:', err.message);
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export const redisClient = RedisClient.getInstance().getClient();

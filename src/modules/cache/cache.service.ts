import crypto from 'crypto';
import { Redis } from 'ioredis';
import { RedisClient } from './redis.client';

export class CacheService {
  private static get redis(): Redis {
    return RedisClient.getInstance().getClient();
  }

  public static generateKey(body: unknown): string {
    const typedBody = body as { model?: unknown; messages?: unknown };
    const relevantData = {
      model: typedBody?.model,
      messages: typedBody?.messages,
    };

    const payload = JSON.stringify(relevantData);
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return `aegis:cache:llm:${hash}`;
  }

  public static async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  public static async set(key: string, value: string, ttlSeconds: number = 86400): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }
}

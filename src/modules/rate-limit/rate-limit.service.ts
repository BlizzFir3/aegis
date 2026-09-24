import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { RedisClient } from '../cache/redis.client';

export class RateLimitService {
  static async register(app: FastifyInstance): Promise<void> {
    const redisInstance = RedisClient.getInstance().getClient();

    await app.register(rateLimit, {
      max: 10,
      timeWindow: '1 minute',
      redis: redisInstance,

      // Comportement de blocage
      // allowList: ['127.0.0.1'], // Utile si tu veux bypasser la limite pour tes propres scripts internes

      errorResponseBuilder: (request, context) => {
        return {
          statusCode: 429,
          error: 'Too Many Requests',
          message: `Aegis : Quota dépassé. Vous avez droit à ${context.max} requêtes par ${context.after}. Réessayez plus tard.`,
        };
      },

      keyGenerator: (request) => {
        return request.ip;
      },
    });
  }
}

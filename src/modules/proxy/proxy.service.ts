import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import proxy, { FastifyHttpProxyOptions } from '@fastify/http-proxy';
import { env } from '../../config/env';
import { CacheService } from '../cache/cache.service';

export class ProxyService {
  static async register(app: FastifyInstance, prefix: string = '/v1'): Promise<void> {
    app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url.startsWith(prefix) && request.method === 'POST' && request.body) {
        const cacheKey = CacheService.generateKey(request.body);
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          // eslint-disable-next-line no-console
          console.log(`Cache HIT: ${cacheKey}`);
          reply.header('x-aegis-cache', 'HIT');
          reply.header('Content-Type', 'application/json');
          return reply.send(cachedData);
        }

        // eslint-disable-next-line no-console
        console.log(`Cache MISS: ${cacheKey}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (request as any).aegisCacheKey = cacheKey;
      }
    });

    app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cacheKey = (request as any).aegisCacheKey;

      if (reply.statusCode === 200 && cacheKey && payload) {
        let responseString = '';

        if (typeof payload === 'string') {
          responseString = payload;
        } else if (Buffer.isBuffer(payload)) {
          responseString = payload.toString('utf8');
        } else {
          responseString = JSON.stringify(payload);
        }

        CacheService.set(cacheKey, responseString).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Erreur lors de la sauvegarde du cache:', err);
        });

        reply.header('x-aegis-cache', 'MISS');
      }

      return payload;
    });

    const proxyOptions: FastifyHttpProxyOptions = {
      upstream: env.UPSTREAM_API_URL,
      prefix: prefix,
      replyOptions: {
        rewriteRequestHeaders: (originalRequest, headers) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { host, 'accept-encoding': _acceptEncoding, ...restHeaders } = headers;
          return {
            ...restHeaders,
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            Host: new URL(env.UPSTREAM_API_URL).host,
            'Accept-Encoding': 'identity',
          };
        },
      },
    };

    await app.register(proxy, proxyOptions);
  }
}

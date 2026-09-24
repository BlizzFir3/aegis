import { FastifyInstance } from 'fastify';
import proxy, { FastifyHttpProxyOptions } from '@fastify/http-proxy';
import { env } from '../../config/env';

export class ProxyService {
  static async register(app: FastifyInstance, prefix: string = '/v1'): Promise<void> {
    const proxyOptions: FastifyHttpProxyOptions = {
      upstream: env.UPSTREAM_API_URL,
      prefix: prefix,
      replyOptions: {
        // En enlevant les types explicites ici, TypeScript va utiliser ceux de FastifyHttpProxyOptions
        rewriteRequestHeaders: (originalRequest, headers) => {
          // On ignore l'accept-encoding (pour forcer identity) et le host original
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { host, 'accept-encoding': _acceptEncoding, ...restHeaders } = headers;

          return {
            ...restHeaders,
            Authorization: `Bearer ${env.GROQ_API_KEY}`,
            Host: new URL(env.UPSTREAM_API_URL).host,
            'Accept-Encoding': 'identity',
          };
        },
        onResponse: async (_request, reply, res) => {
          if (res.statusCode && res.statusCode >= 400) {
            // eslint-disable-next-line no-console
            console.error(`[PROXY ERROR] Upstream a répondu avec un statut: ${res.statusCode}`);
          }
          reply.send(res);
        },
      },
    };

    await app.register(proxy, proxyOptions);
  }
}

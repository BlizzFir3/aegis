import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string(),

  // Configuration Spécifique Groq
  UPSTREAM_API_URL: z.string().url().default('https://api.groq.com/openai/v1'),
  GROQ_API_KEY: z.string().min(1, 'La clé API Groq est requise'),
  TARGET_MODEL: z.string().default('openai/gpt-oss-20b'),
});

export const env = envSchema.parse(process.env);

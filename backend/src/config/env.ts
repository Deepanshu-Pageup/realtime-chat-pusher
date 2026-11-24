import dotenv from 'dotenv';
import { z } from 'zod';

// Only load .env from disk if variables aren't already injected by the runtime/platform
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const envSchema = z.object({

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  // Pusher (real-time channels)
  PUSHER_APP_ID: z.string().min(1, 'PUSHER_APP_ID is required'),
  PUSHER_KEY: z.string().min(1, 'PUSHER_KEY is required'),
  PUSHER_SECRET: z.string().min(1, 'PUSHER_SECRET is required'),
  PUSHER_CLUSTER: z.string().min(1, 'PUSHER_CLUSTER is required'),
  // Auth & security
  CORS_ORIGINS: z
    .string()
    .transform((val) =>
      val
        .split(',')
        .map((origin) => origin.trim().replace(/\/+$/, ''))
        .filter(Boolean)
    ),

  // Logging & rate limiting
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration:');
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.') || 'env';
      console.error(`  - ${path}: ${issue.message}`);
    }
    process.exit(1);
  }
  return Object.freeze(parsed.data);
}

export const env = parseEnv();
export type Env = typeof env;
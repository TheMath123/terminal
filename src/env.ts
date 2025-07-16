import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
  server: {
    APP_URL: z.string({ error: 'APP_URL is required' }),
    REDIS_URL:z.string({ error: 'REDIS_URL is required' }),
    BEARER_TOKEN: z.string({ error: 'BEARER_TOKEN is required' }),
  },
  runtimeEnv: {
    APP_URL: process.env.APP_URL,
    REDIS_URL: process.env.REDIS_URL,
    BEARER_TOKEN: process.env.BEARER_TOKEN,
  }
});
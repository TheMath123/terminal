import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v3';

export const env = createEnv({
  server: {
    VERCEL: z.string({ required_error: 'VERCEL is required' }),
    VERCEL_URL: z.string({ required_error: 'VERCEL_URL is required' }),
    BEARER_TOKEN: z.string({ required_error: 'BEARER_TOKEN is required' }),
  },
  runtimeEnv: {
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    BEARER_TOKEN: process.env.BEARER_TOKEN,
  },
});
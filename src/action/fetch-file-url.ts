'use server';

import { nanoid } from 'nanoid';
import { env } from '@/env';
import { registerSystemAccess } from '@/helpers/system-access';

export async function fetchFileUrl(mappedPath: string): Promise<string> {
  const id = nanoid();
  await registerSystemAccess(id, mappedPath);

  return `${env.APP_URL}/api/system-proxy?id=${id}&file=${encodeURIComponent(mappedPath.replace('/system', ''))}`;
}

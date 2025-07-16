import { redis } from '@/lib/redis';

const EXPIRATION_SECONDS = 60 * 2; // 2 minutos

/**
 * Registra uma chave temporária de acesso com nanoid
 * @param id string - id gerado (nanoid)
 * @param path string - caminho completo do arquivo (ex: /system/arquivos/audio.mp3)
 */
export async function registerSystemAccess(id: string, path: string) {
  const key = `system-access:${id}`;
  await redis.set(key, path, 'EX', EXPIRATION_SECONDS);
}

/**
 * Verifica se o id é válido para o path acessado
 * @param id string
 * @param path string
 * @returns boolean
 */
export async function validateSystemAccess(
  id: string,
  path: string,
): Promise<boolean> {
  const key = `system-access:${id}`;
  console.log(key);
  const storedPath = await redis.get(key);
  console.log(storedPath);
  return storedPath === path;
}

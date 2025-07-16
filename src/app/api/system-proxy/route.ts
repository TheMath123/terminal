import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import type { NextRequest } from 'next/server';
import { join } from 'path';
import { validateSystemAccess } from '@/helpers/system-access';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const filename = url.searchParams.get('file'); // ex: /arquivos/audio.mp3

  if (!id || !filename) {
    return new Response('Missing id or file', { status: 400 });
  }

  const path = `/system${filename}`;
  const isValid = await validateSystemAccess(id, path);
  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const absPath = join(process.cwd(), 'public', 'system', filename);

  try {
    const fileStat = await stat(absPath);
    const stream = createReadStream(absPath);

    return new Response(stream as any, {
      status: 200,
      headers: {
        'Content-Length': fileStat.size.toString(),
        'Content-Type': filename.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4',
      },
    });
  } catch (e) {
    return new Response('Arquivo não encontrado', { status: 404 });
  }
}

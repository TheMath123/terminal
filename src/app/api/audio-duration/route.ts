import ffmpeg from '@/lib/ffmpeg';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fileParam = url.searchParams.get('file');

  if (!fileParam) {
    return NextResponse.json(
      { error: 'Missing file parameter' },
      { status: 400 },
    );
  }

  const filePath = path.join(
    process.cwd(),
    'public',
    decodeURIComponent(fileParam),
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        resolve(
          NextResponse.json(
            { error: 'Failed to get duration' },
            { status: 500 },
          ),
        );
      } else {
        const duration = metadata.format.duration;
        resolve(NextResponse.json({ duration }));
      }
    });
  });
}

import { type NextRequest, NextResponse } from 'next/server';
import { env } from './env';

export async function middleware(request: NextRequest) {
  // Auth with fake bearer token
  const authorizationToken = request.headers.get('authorization');
  console.log(request);
  console.info('Authorization token:', authorizationToken);
  const tokenParts = authorizationToken ? authorizationToken.split(' ') : [];
  if (
    tokenParts.length !== 2 ||
    tokenParts[0] !== 'Bearer' ||
    !tokenParts[1] ||
    tokenParts[1].trim().length === 0 ||
    tokenParts[1].trim() !== env.BEARER_TOKEN
  ) {
    console.error('Unauthorized access attempt to /system');
    console.error('Token content: ', authorizationToken);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.info('Authorized access to /system');
  return NextResponse.next();
}

export const config = {
  matcher: '/system/:path*',
};

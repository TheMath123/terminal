import { NextRequest, NextResponse } from 'next/server';
 
export function middleware(request: NextRequest) {
  const authorizationToken = request.headers.get('authorization')
  const tokenParts = authorizationToken ? authorizationToken.split(' ') : []
  if (
    tokenParts.length !== 2 ||
    tokenParts[0] !== 'Bearer' ||
    !tokenParts[1] ||
    tokenParts[1].trim().length === 0 ||
    tokenParts[1].trim() !== process.env.BEARER_TOKEN
  ) {
    console.log('Unauthorized access attempt to /system');
    console.log('Token content: ', authorizationToken);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log('Authorized access to /system');
  return NextResponse.next()
}
 
export const config = {
  matcher: '/system/:path*'
}

import { NextRequest, NextResponse } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log('============');
  console.log(request);
  console.log('============');
  return NextResponse.next()
}
 
export const config = {
  matcher: [
    {
      source: '/system/:path',
      locale: false,
      has: [
        { type: 'header', key: 'Authorization', value: 'Bearer Token' },
      ],
    }
  ]
}
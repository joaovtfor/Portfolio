import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['pt', 'en'];
const defaultLocale = 'pt';

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self' data:;
  connect-src 'self' https://api.resend.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${!isDev ? "upgrade-insecure-requests;" : ""}
`.replace(/\s{2,}/g, ' ').trim();

// Escolhe o idioma suportado de maior peso (q) no Accept-Language.
// Sem header (ex.: crawlers) usa o padrão; idiomas não suportados caem em inglês.
function negotiateLocale(acceptLanguage: string | null): string {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().toLowerCase().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { language: tag.split('-')[0], q: Number.isNaN(q) ? 0 : q };
    })
    .filter(({ q }) => q > 0)
    .sort((a, b) => b.q - a.q);

  const match = ranked.find(({ language }) => locales.includes(language));
  return match ? match.language : 'en';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  if (pathnameHasLocale) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
  }

  const localeToRedirect = negotiateLocale(request.headers.get('accept-language'));

  request.nextUrl.pathname = `/${localeToRedirect}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

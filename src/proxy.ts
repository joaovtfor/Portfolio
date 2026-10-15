import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['pt', 'en'];
const defaultLocale = 'pt';

const isDev = process.env.NODE_ENV === 'development';
const analyticsEnabled = Boolean(process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN);

// Nonce por request + 'strict-dynamic': só scripts emitidos pelo Next (que recebem o nonce) executam.
// style-src mantém 'unsafe-inline' porque o SSR do React e o Framer Motion geram atributos `style`,
// que um nonce não cobre (e sua presença desativaria o 'unsafe-inline').
function buildCsp(nonce: string): string {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    connect-src 'self'${analyticsEnabled ? ' https://cloudflareinsights.com' : ''};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `.replace(/\s{2,}/g, ' ').trim();
}

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const localeToRedirect = negotiateLocale(request.headers.get('accept-language'));
    request.nextUrl.pathname = `/${localeToRedirect}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

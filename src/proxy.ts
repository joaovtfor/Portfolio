import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Gera um Nonce (Number Used Once) forte para garantir que apenas scripts autorizados rodem
  const nonce = crypto.randomUUID();

  // O ambiente de desenvolvimento do Next.js precisa de 'unsafe-eval' para o Hot Reload funcionar
  const isDev = process.env.NODE_ENV === 'development';
  
  // Montagem da Política de Segurança de Conteúdo (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim(); // Minifica a string para evitar erros de header malformado

  // 1. Injeta o CSP e o Nonce na Requisição (Para o Next.js ler e injetar nas tags <script> no Server-Side)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // 2. Prossegue com a requisição carregando a nova bagagem
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 3. Injeta a Armadura de Headers de Segurança na Resposta (Diretrizes OWASP)
  response.headers.set('Content-Security-Policy', cspHeader);
  
  // Bloqueia tentativas do navegador de "adivinhar" o tipo do arquivo (MIME Sniffing)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Proteção absoluta contra Clickjacking (impede que o site seja aberto dentro de iframes de terceiros)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Força bloqueio em caso de detecção de Cross-Site Scripting em browsers legados
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Controla o vazamento de dados de origem quando o usuário clica em links externos
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Bloqueia preventivamente o acesso do site a hardware sensível do usuário
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Configuração de onde a barreira atua
export const config = {
  matcher: [
    /*
     * Aplica em todas as rotas de páginas, pulando os bastidores:
     * - api (rotas de API podem precisar de headers CORS específicos)
     * - _next/static (arquivos estáticos)
     * - _next/image (imagens otimizadas)
     * - favicon.ico (icone do site)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

# João de For — Creative Front-End Engineer Portfolio 🚀

A storytelling portfolio where engineering and motion are the same craft: a GPU-simulated particle field narrates each section while a strict, accessible and secure Next.js app delivers the content.

## ✨ Features

- **Narrative WebGL:** 65k particles simulated on the GPU (GPGPU ping-pong textures + curl noise). Each section defines a target shape (monolith, sphere, wave grid, torus knot, helix, `>_`) and the scroll morphs between them. A domain-warped fluid shader renders the background at quarter resolution.
- **Persistent shell:** the WebGL canvas, header, cursor and preloader survive route changes; case studies open with shared-element view transitions.
- **Case studies & Lab:** `/[locale]/work/[slug]` deep dives and `/[locale]/lab/[slug]` full-screen WebGL experiments.
- **Graceful degradation:** lighter simulation on mobile, adaptive DPR, static frame for `prefers-reduced-motion`, CSS fallback when WebGL is unavailable.
- **Internationalization (i18n):** PT/EN with `Accept-Language` negotiation (q-values) in the proxy and localized metadata.
- **Accessibility:** semantic landmarks, skip link, keyboard-reachable cards, `aria-current` navigation, live regions on the contact form.
- **Security by Design:** per-request CSP nonce with `'strict-dynamic'`, HSTS and hardening headers, isomorphic Zod validation, honeypot and rate limiting on the contact Server Action.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Node.js runtime, `proxy.ts`)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- **Motion:** GSAP + ScrollTrigger, Lenis, Framer Motion
- **3D / WebGL:** Three.js, React Three Fiber, GLSL (GPUComputationRenderer)
- **State:** Zustand (DOM ↔ WebGL bridge)
- **Forms & Validation:** React Hook Form, Zod
- **Infrastructure:** Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`), Resend

## 📂 Architecture

- `src/app` — App Router routes (home, case studies, Lab), metadata, sitemap and robots.
- `src/proxy.ts` — locale negotiation and per-request CSP nonce.
- `src/components/layout` — persistent shell: header, footer, preloader, cursor, mobile menu and the `SceneDirector` (publishes scroll narrative to the store).
- `src/components/webgl` — isolated 3D layer: canvas, background shader, GPGPU particle engine and shape generation.
- `src/store` — Zustand stores (`sceneStore`, `uiStore`): the only bridge between DOM and WebGL.
- `src/data`, `src/dictionaries` — resume/projects data (source of truth: the CV) and PT/EN copy.
- `.specs` — Spec-Driven Development documents that guide every feature.

## ⚙️ Environment variables

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Contact form delivery (Worker secret: `wrangler secret put RESEND_API_KEY`; locally in `.env`/`.dev.vars`). |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and robots (defaults to `https://joaodefor.portfolio.workers.dev`). |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Optional Cloudflare Web Analytics token (cookieless); enables the beacon with the CSP nonce. |
| `ALLOWED_DEV_ORIGINS` | Optional comma-separated LAN origins allowed to reach the dev server (e.g. testing on a phone). |

## ☁️ Development & Deployment

```bash
pnpm dev            # Next dev server (preferably inside Docker: docker compose up)
pnpm build          # Next production build
pnpm run preview    # Build the Worker with OpenNext and run it locally with Wrangler
pnpm run deploy     # Build and deploy the Worker (`pnpm deploy` alone is a pnpm built-in)
```

The OpenNext build relies on symlinks; on Windows run it inside Docker/WSL (CI runs it on Linux). The rate limit in the Server Action is per isolate. WAF rate-limiting rules can only match POST requests on Business plans and above; on Free/Pro use the Workers Rate Limiting binding for a stronger limit.

---
Designed and developed by [João Vitor de For dos Santos](https://joaodefor.portfolio.workers.dev).

LinkedIn: [@joaodefor](https://linkedin.com/in/joaodefor).

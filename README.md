# João de For — Creative Developer Portfolio 🚀

A high-performance, interactive portfolio blending clean, minimalist UI with advanced 3D WebGL architectures. Built to showcase software engineering skills, creative development, and a pixel-perfect attention to detail.

## ✨ Features

- **Immersive 3D Experience:** Custom WebGL shaders, fluid meshes, and interactive particle systems running on the GPU using Three.js and @react-three/fiber.
- **Performance First:** Smart lazy-loading (Dynamic Imports) defers heavy 3D calculations until after the initial render, achieving high Core Web Vitals and LCP scores.
- **Internationalization (i18n):** Fully localized in English (EN) and Portuguese (PT) with intelligent middleware routing and dynamic SEO metadata.
- **Deep Accessibility (a11y):** Screen-reader optimized, full keyboard navigation, high contrast ratios, semantic HTML, and prefers-reduced-motion detection that safely disables 3D animations for users with vestibular disorders.
- **Privacy Focused:** 100% Cookieless analytics via Cloudflare Web Analytics (LGPD/GDPR compliant without intrusive consent banners).
- **Secure Server Actions:** Contact form powered by Next.js Server Actions, validated isothermally with Zod, and delivered via Resend.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router, Edge Runtime)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion
- **3D / WebGL:** Three.js, React Three Fiber, GSAP
- **Forms & Validation:** React Hook Form, Zod
- **Infrastructure:** Cloudflare Pages, Resend (Emails)

## 📂 Architecture Focus

The architecture separates the structural DOM from the WebGL Canvas:
- /src/app - App Router, internationalization middleware, and dynamic SEO endpoints.
- /src/components/webgl - Isolated 3D environment. Contains the Canvas, custom shaders, and particle physics. 
- /src/components/layout - Structural UI components (Floating menus, custom cursors, layout wrappers).
- /src/actions - Next.js Server Actions for secure backend processing.
- /src/dictionaries - Static i18n translation objects.

## ☁️ Deployment

This project is optimized for deployment on **Cloudflare Pages**. 
All dynamic routes explicitly export the Edge Runtime configuration (\export const runtime = 'edge';\) to ensure native compatibility with Cloudflare's V8 Isolates.

---
Designed and developed by [João Vitor de For dos Santos](https://joaodefor.pages.dev).

LinkedIn: [@joaodefor](https://linedin.com/in/joaodefor).

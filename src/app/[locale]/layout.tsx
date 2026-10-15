import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "../globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { getDictionary, toLocale } from "@/dictionaries";
import { getResume } from "@/data/resume";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const ANALYTICS_TOKEN = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { personalInfo } = getResume(locale);

  const title = `${personalInfo.shortName} — ${personalInfo.role}`;
  const description = locale === "en"
    ? "Creative Front-End Engineer building high-performance interfaces with WebGL, motion and solid engineering."
    : "Creative Front-End Engineer: interfaces de alta performance com WebGL, motion e engenharia sólida.";

  return {
    title: {
      default: title,
      template: `%s — ${personalInfo.shortName}`,
    },
    description,
    authors: [{ name: personalInfo.name }],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'pt-BR': '/pt',
        'en-US': '/en',
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
      siteName: personalInfo.shortName,
      locale: locale === "en" ? "en_US" : "pt_BR",
      type: "website",
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${personalInfo.shortName} - Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const locale = toLocale((await params).locale);
  // Ler o nonce torna a renderização dinâmica, requisito da CSP com nonce (ver STACK.spec.md).
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const dict = getDictionary(locale);
  const { personalInfo } = getResume(locale);
  const info = {
    shortName: personalInfo.shortName,
    location: personalInfo.location,
    timeZone: personalInfo.timeZone,
    email: personalInfo.email,
    linkedin: personalInfo.linkedin,
    github: personalInfo.github,
  };

  return (
    <html
      lang={locale === "en" ? "en" : "pt-BR"}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
    >
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-foreground focus:rounded focus:outline-none">
          {dict.a11y.skipToContent}
        </a>
        <SmoothScrollProvider>
          <SiteShell dict={dict} locale={locale} info={info}>
            {children}
          </SiteShell>
        </SmoothScrollProvider>
        {ANALYTICS_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: ANALYTICS_TOKEN })}
            nonce={nonce}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

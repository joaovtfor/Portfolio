import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "../globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export const runtime = 'edge';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const title = "João de For";
  const description = locale === "en" ? "Front-End & Full-Stack Engineer specializing in high performance interfaces." : "Engenheiro Front-End & Full-Stack especializado em interfaces de alta performance.";
  
  return {
    title,
    description,
    authors: [{ name: "João Vitor de For dos Santos" }],
    metadataBase: new URL("https://joaovtfor.dev"),
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
      url: `https://joaovtfor.dev/${locale}`,
      siteName: title,
      locale: locale === "en" ? "en_US" : "pt_BR",
      type: "website",
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: "João de For - Portfolio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@joaovtfor",
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
  const { locale } = await params;
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
    >
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-foreground focus:rounded focus:outline-none">
          Skip to content
        </a>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

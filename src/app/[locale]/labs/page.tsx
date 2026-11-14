import type { Metadata } from "next";
import { LabSection } from "@/components/lab/LabSection";
import { getDictionary, toLocale } from "@/dictionaries";

type LabsParams = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: LabsParams }): Promise<Metadata> {
  const dict = getDictionary(toLocale((await params).locale));

  // Área de testes de layout: fora da home, do sitemap e dos buscadores.
  return {
    title: dict.lab.title,
    description: dict.lab.description,
    robots: { index: false, follow: false },
  };
}

export default async function LabsPage({ params }: { params: LabsParams }) {
  const locale = toLocale((await params).locale);
  return <LabSection dict={getDictionary(locale)} locale={locale} />;
}

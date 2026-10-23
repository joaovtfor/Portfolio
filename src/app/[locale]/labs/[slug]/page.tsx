import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabExperimentView } from "@/components/lab/LabExperimentView";
import { getDictionary, toLocale } from "@/dictionaries";
import { isLabSlug } from "@/data/lab";

type LabParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: LabParams }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLabSlug(slug)) return {};
  const locale = toLocale(rawLocale);
  const experiment = getDictionary(locale).lab.experiments[slug];

  // Área de testes de layout: fora do sitemap e dos buscadores.
  return {
    title: `Labs — ${experiment.title}`,
    description: experiment.description,
    robots: { index: false, follow: false },
  };
}

export default async function LabExperimentPage({ params }: { params: LabParams }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLabSlug(slug)) notFound();
  const locale = toLocale(rawLocale);

  return <LabExperimentView dict={getDictionary(locale)} locale={locale} slug={slug} />;
}

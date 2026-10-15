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

  return {
    title: `Lab — ${experiment.title}`,
    description: experiment.description,
    alternates: {
      canonical: `/${locale}/lab/${slug}`,
      languages: {
        "pt-BR": `/pt/lab/${slug}`,
        "en-US": `/en/lab/${slug}`,
      },
    },
  };
}

export default async function LabExperimentPage({ params }: { params: LabParams }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLabSlug(slug)) notFound();
  const locale = toLocale(rawLocale);

  return <LabExperimentView dict={getDictionary(locale)} locale={locale} slug={slug} />;
}

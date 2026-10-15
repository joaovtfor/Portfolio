import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyView } from "@/components/case-study/CaseStudyView";
import { getDictionary, toLocale } from "@/dictionaries";
import { getProject, getProjects } from "@/data/projects";

type CaseStudyParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: CaseStudyParams }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const project = getProject(locale, slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: {
        "pt-BR": `/pt/work/${slug}`,
        "en-US": `/en/work/${slug}`,
      },
    },
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      images: [{ url: project.image, alt: project.title }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: CaseStudyParams }) {
  const { locale: rawLocale, slug } = await params;
  const locale = toLocale(rawLocale);
  const projects = getProjects(locale);
  const index = projects.findIndex((project) => project.slug === slug);
  if (index < 0) notFound();

  const next = projects[(index + 1) % projects.length];

  return (
    <CaseStudyView
      dict={getDictionary(locale)}
      locale={locale}
      project={projects[index]}
      position={{ index: index + 1, total: projects.length }}
      next={{ slug: next.slug, title: next.title }}
    />
  );
}

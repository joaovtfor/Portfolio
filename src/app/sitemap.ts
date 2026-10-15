import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { locales } from "@/dictionaries";
import { getProjects } from "@/data/projects";
import { LAB_EXPERIMENTS } from "@/data/lab";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "",
    ...getProjects("pt").map((project) => `/work/${project.slug}`),
    ...LAB_EXPERIMENTS.map((slug) => `/lab/${slug}`),
  ];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    }))
  );
}

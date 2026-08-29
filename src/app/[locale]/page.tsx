import { HeroSection } from "@/components/hero/HeroSection";
import { ProjectsWrapper } from "@/components/projects/ProjectsWrapper";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { getDictionary } from "@/dictionaries";
import { getProjects } from "@/data/projects";
import { getResume } from "@/data/resume";

export default async function Home({ params }: { params: Promise<{ locale: 'pt' | 'en' }> }) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const projects = getProjects(locale);
  const resume = getResume(locale);

  return (
    <PageWrapper dict={dict} locale={locale}>
      <HeroSection dict={dict} resume={resume} />
      <ProjectsWrapper dict={dict} projects={projects} />
      <ExperienceSection dict={dict} resume={resume} locale={locale} />
      <ContactSection dict={dict} />
    </PageWrapper>
  );
}

import { HeroSection } from "@/components/hero/HeroSection";
import { AboutSection } from "@/components/about/AboutSection";
import { ProjectsWrapper } from "@/components/projects/ProjectsWrapper";
import { LabSection } from "@/components/lab/LabSection";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { getDictionary, toLocale } from "@/dictionaries";
import { getProjects } from "@/data/projects";
import { getResume } from "@/data/resume";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const dict = getDictionary(locale);
  const projects = getProjects(locale);
  const resume = getResume(locale);
  const { shortName, role, focus, stack } = resume.personalInfo;

  return (
    <>
      <HeroSection dict={dict} name={shortName} info={{ role, focus, stack }} />
      <AboutSection dict={dict} resume={resume} />
      <ProjectsWrapper dict={dict} projects={projects} locale={locale} />
      <LabSection dict={dict} locale={locale} />
      <ExperienceSection dict={dict} resume={resume} locale={locale} />
      <ContactSection dict={dict} />
    </>
  );
}

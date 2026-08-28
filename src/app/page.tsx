import { HeroSection } from "@/components/hero/HeroSection";
import { ProjectsWrapper } from "@/components/projects/ProjectsWrapper";
import { ExperienceSection } from "@/components/experience/ExperienceSection";
import { ContactSection } from "@/components/contact/ContactSection";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function Home() {
  return (
    <PageWrapper>
      <HeroSection />
      <ProjectsWrapper />
      <ExperienceSection />
      <ContactSection />
    </PageWrapper>
  );
}

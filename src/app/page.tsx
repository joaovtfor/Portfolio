import { HeroSection } from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <HeroSection />
      {/* Próximas seções (Projects, Contact) entrarão aqui */}
      <div className="h-screen" /> {/* Placeholder para permitir scroll temporário para testar o shader desligando */}
    </main>
  );
}

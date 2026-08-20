import { WebGLScene } from "@/components/webgl/Scene";
import { FluidMesh } from "@/components/webgl/FluidMesh";
import { Particles } from "@/components/webgl/Particles";
import { HeroTitle } from "./HeroTitle";
import { HeroButton } from "./HeroButton";

export function HeroSection() {
  return (
    // 'h-[100dvh]' respeita a barra de endereços do celular (evita quebra de layout)
    <section className="relative w-full h-[100dvh] overflow-hidden">
      
      {/* 
        Canvas de Fundo (Absoluto) 
        A camada tem z-index base para ficar atrás do HTML que tem z-10
      */}
      <div className="absolute inset-0 w-full h-full z-0 bg-background">
        <WebGLScene>
          <FluidMesh />
          <Particles />
        </WebGLScene>
      </div>

      {/* Camada de Conteúdo HTML (Z-index superior) */}
      <div className="relative z-10 flex flex-col w-full h-full max-w-[1440px] mx-auto pointer-events-none p-6 md:p-12">
        
        {/* Espaçador flexível para empurrar o título pro centro */}
        <div className="flex-1 flex items-center justify-center">
          <HeroTitle />
        </div>
        
        {/* Barra Inferior (Metadados e CTA) */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 w-full">
          {/* Metadados (Role, Focus, Stack) */}
          <div className="flex flex-col gap-1 font-sans text-[10px] sm:text-xs tracking-widest text-neutral-400 uppercase">
            <p><strong className="text-neutral-600 font-bold">Role:</strong> Frontend Engineer</p>
            <p><strong className="text-neutral-600 font-bold">Focus:</strong> High-Performance UI</p>
            <p><strong className="text-neutral-600 font-bold">Stack:</strong> Next.js, TypeScript, UI/UX Design</p>
          </div>
          
          <div className="flex items-center">
            <HeroButton />
          </div>
        </div>

      </div>
      
    </section>
  );
}

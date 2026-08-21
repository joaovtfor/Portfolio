export interface ExperienceItem {
  id: number;
  period: string;
  company?: string;
  role: string;
  description: string;
  skills: string[];
}

interface ExperienceListProps {
  experiences: ExperienceItem[];
}

export function ExperienceList({ experiences }: ExperienceListProps) {
  return (
    <div className="md:w-3/5 lg:w-2/3 flex flex-col w-full mt-8 md:mt-0">
      {experiences.map((exp) => (
        <div 
          key={exp.id} 
          className="flex flex-col py-8 md:py-10 border-t border-white/5 first:border-t-white/10 transition-colors hover:bg-white/[0.02] px-4 md:px-8 -mx-4 md:-mx-8 rounded-2xl select-none"
        >
          {/* Company and Date */}
          <span className="text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest mb-3 font-sans">
            {exp.company} <span className="text-white/30 mx-2">&bull;</span> {exp.period}
          </span>
          
          {/* Role */}
          <h3 className="text-xl md:text-3xl font-serif text-white mb-2">
            {exp.role}
          </h3>
          
          {/* Description */}
          <p className="text-neutral-400 text-xs md:text-sm leading-relaxed mb-6 max-w-2xl font-sans">
            {exp.description}
          </p>
          
          {/* Skills (Pills) */}
          <div className="flex flex-wrap gap-2">
            {exp.skills.map(skill => (
              <span 
                key={skill} 
                className="px-3 py-1 rounded-full border border-white/10 text-[9px] sm:text-[10px] text-neutral-400 bg-transparent font-sans tracking-wide"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

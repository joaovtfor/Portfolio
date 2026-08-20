export interface ExperienceItem {
  id: number;
  period: string;
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
          className="flex flex-col py-12 border-t border-white/5 first:border-t-white/10 transition-colors hover:bg-white/[0.02] px-4 md:px-8 -mx-4 md:-mx-8 rounded-2xl"
        >
          {/* Date */}
          <span className="text-[var(--foreground)] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 font-sans select-none">
            {exp.period}
          </span>
          
          {/* Role */}
          <h3 className="text-2xl md:text-4xl font-serif text-white mb-3">
            {exp.role}
          </h3>
          
          {/* Description */}
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-8 max-w-2xl font-sans">
            {exp.description}
          </p>
          
          {/* Skills (Pills) */}
          <div className="flex flex-wrap gap-3">
            {exp.skills.map(skill => (
              <span 
                key={skill} 
                className="px-4 py-1.5 rounded-full border border-white/10 text-[10px] sm:text-xs text-neutral-400 bg-transparent font-sans tracking-wide select-none"
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

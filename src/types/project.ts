import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  techStack: z.array(z.string()),
  description: z.string(),
  repositoryUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

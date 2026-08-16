export type ProjectTemplate = "vite-base" | "next-base";

export interface CreateProjectPayload {
  name: string;
  path: string;
  template: ProjectTemplate;
  initializeGit: boolean;
}

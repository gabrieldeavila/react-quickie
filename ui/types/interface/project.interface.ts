export type ProjectTemplate =
  | "vite-base"
  | "next-base"
  | "nest-base"
  | "nest-vite-base";

export interface CreateProjectPayload {
  name: string;
  path: string;
  template: ProjectTemplate;
  initializeGit: boolean;
}

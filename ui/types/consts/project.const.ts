import type { ProjectTemplate } from "../interface/project.interface";

export const CREATE_PROJECT_URL = `${import.meta.env.VITE_API_URL}/project/create`;
export const CHAT_API_URL = `${import.meta.env.VITE_API_URL}/chat`;

export const PROJECT_TEMPLATE_OPTIONS: Array<{
  label: string;
  value: ProjectTemplate;
}> = [
  { label: "vite-base (react router)", value: "vite-base" },
  { label: "next-base", value: "next-base" },
  { label: "nest-base (backend)", value: "nest-base" },
  {
    label: "Nest + Vite (servidor fullstack)",
    value: "nest-vite-base",
  },
];

export const MAX_VISIBLE_MESSAGES = 500;

import { getApiUrl } from "@/host/runtime-config";
import type { ProjectTemplate } from "../interface/project.interface";

// Getters: in VSCode the API URL is injected at runtime, not at build time.
export const getCreateProjectUrl = () => `${getApiUrl()}/project/create`;
export const getChatApiUrl = () => `${getApiUrl()}/chat`;
export const getModelsApiUrl = () => `${getApiUrl()}/models`;
export const getMcpApiUrl = () => `${getApiUrl()}/mcp`;
export const getInstructionsApiUrl = () => `${getApiUrl()}/instructions`;
export const getApprovalsApiUrl = () => `${getApiUrl()}/approvals`;

export const PROJECT_TEMPLATE_OPTIONS: Array<{
  label: string;
  value: ProjectTemplate;
}> = [
  { label: "vite-base (react router)", value: "vite-base" },
  { label: "next-base", value: "next-base" },
  { label: "nest-base (backend)", value: "nest-base" },
  {
    label: "Nest + Vite (full-stack server)",
    value: "nest-vite-base",
  },
];

export const MAX_VISIBLE_MESSAGES = 500;

import type { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";

export enum AgentFocusEnum {
  FRONTEND = "frontend",
  BACKEND = "backend",
  AGNOSTIC = "agnostic",
  GIT = "git",
}

export enum AgentSpecialtyEnum {
  NONE = "none",
  LANDING_PAGES = "landing_pages",
  FORMS = "forms",
  REFACTOR = "refactor",
}

export type CombinedAgentEnum = AgentFocusEnum | AgentFocusPluginEnum;
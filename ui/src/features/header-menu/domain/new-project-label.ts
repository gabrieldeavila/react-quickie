import { AgentFocusEnum, type CombinedAgentEnum } from "~types/enum/agent.enum";
import type { HostFeatures } from "@/host/domain/host-features";

const NEW_PROJECT_LABELS: Partial<Record<CombinedAgentEnum, string>> = {
  [AgentFocusEnum.FRONTEND]: "New frontend",
  [AgentFocusEnum.BACKEND]: "New backend",
  [AgentFocusEnum.AGNOSTIC]: "New full-stack server",
};

/** Menu label for "new project" in this mode, or null when it isn't offered. */
export function newProjectLabel(
  focus: CombinedAgentEnum,
  features: HostFeatures,
): string | null {
  if (!features.canCreateProjects) return null;
  return NEW_PROJECT_LABELS[focus] ?? null;
}

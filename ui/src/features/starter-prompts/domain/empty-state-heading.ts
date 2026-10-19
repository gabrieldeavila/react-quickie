import { AgentFocusEnum, type CombinedAgentEnum } from "~types/enum/agent.enum";
import { AgentFocusPluginEnum } from "~types/plugin/specialty.plugin";

const DEFAULT_HEADING = "What do you want to build?";

const HEADINGS: Partial<Record<CombinedAgentEnum, string>> = {
  [AgentFocusEnum.AGNOSTIC]: "What are you working on?",
  [AgentFocusEnum.GIT]: "What do you want to do with Git?",
  [AgentFocusPluginEnum.AGENT_BUILDER]: "What agent do you want to build?",
};

/** The empty-state heading for a mode. */
export function emptyStateHeading(focus: CombinedAgentEnum): string {
  return HEADINGS[focus] ?? DEFAULT_HEADING;
}

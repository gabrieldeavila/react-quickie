import type { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";

export type ProjectContext = {
  reference: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  planningModeEnabled: boolean;
};

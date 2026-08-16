import type { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";

export interface CreateChatTransportParams {
  projectRoot: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  planningModeEnabled: boolean;
}

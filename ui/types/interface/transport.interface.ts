import type { AgentSpecialtyEnum, CombinedAgentEnum } from "../enum/agent.enum";

export interface CreateChatTransportParams {
  projectRoot: string;
  focus: CombinedAgentEnum;
  specialty: AgentSpecialtyEnum;
  planningModeEnabled: boolean;
}

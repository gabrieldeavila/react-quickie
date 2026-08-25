import type { CombinedAgentEnum } from "../enum/agent.enum";

export interface CreateChatTransportParams {
  projectRoot: string;
  focus: CombinedAgentEnum;
  specialty: string;
  planningModeEnabled: boolean;
}

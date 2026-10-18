import type { CombinedAgentEnum } from "../enum/agent.enum";
import type { ModelTarget } from "@/features/models/domain/filter-parts-by-capabilities";

export interface CreateChatTransportParams {
  projectRoot: string;
  focus: CombinedAgentEnum;
  specialty: string;
  /** `provider:model`; null lets the API use its default. */
  model: string | null;
  /** Capabilities of `model`; unknown until the catalog loads. */
  modelTarget?: ModelTarget;
}

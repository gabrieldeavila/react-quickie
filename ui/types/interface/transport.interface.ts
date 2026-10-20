import type { ModelTarget } from "@/features/models/domain/filter-parts-by-capabilities";

export interface CreateChatTransportParams {
  projectRoot: string;
  /** Instruction ids selected for the conversation. */
  instructionIds: string[];
  /** `provider:model`; null lets the API use its default. */
  model: string | null;
  /** Capabilities of `model`; unknown until the catalog loads. */
  modelTarget?: ModelTarget;
}

import { firstAvailableModel, type SelectedModel } from './find-model';
import type { ProviderInfo } from './model-catalog.types';

export type SubagentModelSources = {
  /** `DOTY_SUBAGENT_MODEL`. */
  subagentModel?: string;
  /** The model the parent conversation runs on. */
  conversationModel?: string;
  defaultModel?: SelectedModel;
};

/**
 * `DOTY_SUBAGENT_MODEL` → conversation model → default. A configured ref
 * whose provider has no key is skipped instead of failing the subagent.
 * (Phase 4 puts the agent definition's `model` in front of this list.)
 */
export function resolveSubagentModel(
  providers: ProviderInfo[],
  { subagentModel, conversationModel, defaultModel }: SubagentModelSources,
): SelectedModel | undefined {
  return (
    firstAvailableModel(providers, [subagentModel, conversationModel]) ??
    defaultModel
  );
}

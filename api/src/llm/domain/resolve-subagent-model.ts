import { firstAvailableModel, type SelectedModel } from './find-model';
import type { ProviderInfo } from './model-catalog.types';

export type SubagentModelSources = {
  /** The agent definition's frontmatter `model` (undefined = inherit). */
  agentModel?: string;
  /** `DOTY_SUBAGENT_MODEL`. */
  subagentModel?: string;
  /** The model the parent conversation runs on. */
  conversationModel?: string;
  defaultModel?: SelectedModel;
};

/**
 * Agent frontmatter `model` → `DOTY_SUBAGENT_MODEL` → conversation model →
 * default. A configured ref whose provider has no key is skipped instead of
 * failing the subagent.
 */
export function resolveSubagentModel(
  providers: ProviderInfo[],
  {
    agentModel,
    subagentModel,
    conversationModel,
    defaultModel,
  }: SubagentModelSources,
): SelectedModel | undefined {
  return (
    firstAvailableModel(providers, [
      agentModel,
      subagentModel,
      conversationModel,
    ]) ?? defaultModel
  );
}

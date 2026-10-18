import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProviderRegistry, type LanguageModel } from 'ai';
import { availableProviders } from '../domain/available-providers';
import { firstAvailableModel, type SelectedModel } from '../domain/find-model';
import type { LlmEnv, ProviderInfo } from '../domain/model-catalog.types';
import { PROVIDER_CATALOG } from '../domain/provider-catalog';
import { readMaxRetries } from '../domain/read-max-retries';
import { resolveDefaultModel } from '../domain/resolve-default-model';
import { resolveSubagentModel } from '../domain/resolve-subagent-model';
import { selectRequestModel } from '../domain/select-request-model';
import { buildRegistryProviders } from './provider-factories';
import { readLlmEnv } from './read-llm-env';

/** Built once at startup from the providers that have keys configured. */
@Injectable()
export class ProviderRegistryService {
  private readonly env: LlmEnv;
  private readonly providers: ProviderInfo[];
  private readonly defaultModel: SelectedModel | undefined;
  private readonly registry: ReturnType<typeof createProviderRegistry>;
  /** `DOTY_MAX_RETRIES`: passed to every model call (chat, subagents, summaries). */
  readonly maxRetries: number;

  constructor(configService: ConfigService) {
    this.env = readLlmEnv(configService);
    this.providers = availableProviders(PROVIDER_CATALOG, this.env);
    this.defaultModel = resolveDefaultModel(this.providers, this.env);
    this.maxRetries = readMaxRetries(this.env.DOTY_MAX_RETRIES);
    this.registry = createProviderRegistry(
      buildRegistryProviders(
        this.providers.map((provider) => provider.id),
        this.env,
      ),
    );
  }

  listProviders(): ProviderInfo[] {
    return this.providers;
  }

  getDefault(): SelectedModel | undefined {
    return this.defaultModel;
  }

  /** Throws `UnknownModelError` / `NoModelConfiguredError`. */
  select(requested: unknown): SelectedModel {
    return selectRequestModel(this.providers, requested, this.defaultModel);
  }

  selectForSubagent(
    conversationModel?: string,
    agentModel?: string,
  ): SelectedModel | undefined {
    return resolveSubagentModel(this.providers, {
      agentModel,
      subagentModel: this.env.DOTY_SUBAGENT_MODEL,
      conversationModel,
      defaultModel: this.defaultModel,
    });
  }

  /** `DOTY_SUMMARY_MODEL` (when its provider has a key) → conversation model. */
  selectForSummary(conversation: SelectedModel): SelectedModel {
    return (
      firstAvailableModel(this.providers, [this.env.DOTY_SUMMARY_MODEL]) ??
      conversation
    );
  }

  languageModel(selected: SelectedModel): LanguageModel {
    return this.registry.languageModel(selected.ref as `${string}:${string}`);
  }
}

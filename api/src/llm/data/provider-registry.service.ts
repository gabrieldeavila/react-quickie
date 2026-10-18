import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createProviderRegistry, type LanguageModel } from 'ai';
import { availableProviders } from '../domain/available-providers';
import type { SelectedModel } from '../domain/find-model';
import type { LlmEnv, ProviderInfo } from '../domain/model-catalog.types';
import { PROVIDER_CATALOG } from '../domain/provider-catalog';
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

  constructor(configService: ConfigService) {
    this.env = readLlmEnv(configService);
    this.providers = availableProviders(PROVIDER_CATALOG, this.env);
    this.defaultModel = resolveDefaultModel(this.providers, this.env);
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

  selectForSubagent(conversationModel?: string): SelectedModel | undefined {
    return resolveSubagentModel(this.providers, {
      subagentModel: this.env.DOTY_SUBAGENT_MODEL,
      conversationModel,
      defaultModel: this.defaultModel,
    });
  }

  languageModel(selected: SelectedModel): LanguageModel {
    return this.registry.languageModel(selected.ref as `${string}:${string}`);
  }
}

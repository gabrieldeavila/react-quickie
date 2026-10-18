/** Shape of `GET /models` (only providers with a configured key). */
export type ModelCapabilities = {
  supportsTools: boolean;
  supportsImages: boolean;
  supportsReasoning: boolean;
};

export type CatalogModel = ModelCapabilities & {
  id: string;
  label: string;
  contextWindow?: number;
};

export type CatalogProvider = {
  id: string;
  label: string;
  models: CatalogModel[];
};

export type ModelCatalog = {
  /** `provider:model`, or null when no provider has a key. */
  default: string | null;
  providers: CatalogProvider[];
};

export type ResolvedModel = {
  ref: string;
  providerId: string;
  providerLabel: string;
  model: CatalogModel;
};

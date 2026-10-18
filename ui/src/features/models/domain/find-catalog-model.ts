import type { ModelCatalog, ResolvedModel } from "./model-catalog.types";

/** `provider:model` → the catalog entry, split on the first colon. */
export function findCatalogModel(
  catalog: ModelCatalog,
  ref: string | null | undefined,
): ResolvedModel | undefined {
  if (!ref) return undefined;
  const separator = ref.indexOf(":");
  if (separator <= 0) return undefined;

  const providerId = ref.slice(0, separator);
  const modelId = ref.slice(separator + 1);
  const provider = catalog.providers.find((item) => item.id === providerId);
  const model = provider?.models.find((item) => item.id === modelId);
  if (!provider || !model) return undefined;

  return { ref, providerId, providerLabel: provider.label, model };
}

/** Every available model, flattened in catalog order. */
export function listCatalogModels(catalog: ModelCatalog): ResolvedModel[] {
  return catalog.providers.flatMap((provider) =>
    provider.models.map((model) => ({
      ref: `${provider.id}:${model.id}`,
      providerId: provider.id,
      providerLabel: provider.label,
      model,
    })),
  );
}

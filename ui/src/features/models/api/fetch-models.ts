import { MODELS_API_URL } from "~types/consts/project.const";
import type { ModelCatalog } from "../domain/model-catalog.types";

/** `GET /models`: the providers with a configured key and the default model. */
export async function fetchModels(signal?: AbortSignal): Promise<ModelCatalog> {
  const response = await fetch(MODELS_API_URL, { signal });
  if (!response.ok) {
    throw new Error(`Não foi possível carregar os modelos (${response.status}).`);
  }
  return (await response.json()) as ModelCatalog;
}

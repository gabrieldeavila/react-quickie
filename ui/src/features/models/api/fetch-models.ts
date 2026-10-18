import { getModelsApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import type { ModelCatalog } from "../domain/model-catalog.types";

/** `GET /models`: the providers with a configured key and the default model. */
export async function fetchModels(signal?: AbortSignal): Promise<ModelCatalog> {
  const response = await authFetch(getModelsApiUrl(), { signal });
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar os modelos (${response.status}).`,
    );
  }
  return (await response.json()) as ModelCatalog;
}

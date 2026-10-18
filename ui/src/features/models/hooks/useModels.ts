import { useEffect, useState } from "react";
import { fetchModels } from "../api/fetch-models";
import type { ModelCatalog } from "../domain/model-catalog.types";

/** Loads the model catalog once. `catalog` stays null while loading or on error. */
export function useModels() {
  const [catalog, setCatalog] = useState<ModelCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchModels(controller.signal)
      .then(setCatalog)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : String(reason));
      });

    return () => controller.abort();
  }, []);

  return { catalog, error };
}

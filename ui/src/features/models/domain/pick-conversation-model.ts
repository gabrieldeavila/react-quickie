import { findCatalogModel } from "./find-catalog-model";
import type { ModelCatalog } from "./model-catalog.types";

export type ModelPick = {
  /** The model to send, or null when nothing is available. */
  ref: string | null;
  /** The conversation's stored model, when it is no longer available. */
  unavailable?: string;
};

type PickInput = {
  catalog: ModelCatalog;
  /** `conversations.model` of the active conversation. */
  stored?: string;
  /** The last model the user picked (localStorage). */
  lastUsed?: string | null;
};

const isAvailable = (catalog: ModelCatalog, ref?: string | null) =>
  findCatalogModel(catalog, ref) !== undefined;

/**
 * Stored model → (new conversation) last-used model → default. A stored model
 * whose provider lost its key falls back to the default and is reported, so
 * the UI can say so; the stored value itself is left untouched.
 */
export function pickConversationModel({
  catalog,
  stored,
  lastUsed,
}: PickInput): ModelPick {
  if (stored) {
    return isAvailable(catalog, stored)
      ? { ref: stored }
      : { ref: catalog.default, unavailable: stored };
  }
  if (isAvailable(catalog, lastUsed)) return { ref: lastUsed ?? null };
  return { ref: catalog.default };
}

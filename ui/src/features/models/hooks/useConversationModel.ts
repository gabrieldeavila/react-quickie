import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatConversation } from "~types/interface/chat-db.interface";
import {
  readLastUsedModel,
  writeLastUsedModel,
} from "../api/last-used-model.storage";
import { saveConversationModel } from "../api/save-conversation-model";
import {
  findCatalogModel,
  listCatalogModels,
} from "../domain/find-catalog-model";
import type { ModelTarget } from "../domain/filter-parts-by-capabilities";
import { pickConversationModel } from "../domain/pick-conversation-model";
import { useModels } from "./useModels";

type UseConversationModelInput = {
  conversation: ChatConversation | undefined;
  reloadConversations: () => Promise<void>;
};

/**
 * The model of the active conversation: what the picker shows, what the
 * transport sends, and the capabilities the composer and request filter use.
 */
export function useConversationModel({
  conversation,
  reloadConversations,
}: UseConversationModelInput) {
  const { catalog, error } = useModels();
  const [lastUsed, setLastUsed] = useState<string | null>(readLastUsedModel);

  // Until the catalog loads, send no model (the API uses its default) and
  // don't report the stored one as unavailable.
  const pick = useMemo(
    () =>
      catalog
        ? pickConversationModel({ catalog, stored: conversation?.model, lastUsed })
        : { ref: null },
    [catalog, conversation?.model, lastUsed],
  );

  const resolved = useMemo(
    () => (catalog ? findCatalogModel(catalog, pick.ref) : undefined),
    [catalog, pick.ref],
  );

  const options = useMemo(
    () => (catalog ? listCatalogModels(catalog) : []),
    [catalog],
  );

  const target: ModelTarget | undefined = useMemo(
    () =>
      resolved
        ? { providerId: resolved.providerId, capabilities: resolved.model }
        : undefined,
    [resolved],
  );

  const conversationId = conversation?.id;

  const persist = useCallback(
    async (id: string, ref: string) => {
      await saveConversationModel(id, ref);
      await reloadConversations();
    },
    [reloadConversations],
  );

  const selectModel = useCallback(
    (ref: string) => {
      setLastUsed(ref);
      writeLastUsedModel(ref);
      if (conversationId) void persist(conversationId, ref);
    },
    [conversationId, persist],
  );

  // A conversation without a model (new, or saved before Phase 2) adopts the
  // one it is running on, so later switches of the last-used model don't move it.
  const hasStoredModel = Boolean(conversation?.model);
  useEffect(() => {
    if (!conversationId || hasStoredModel || !pick.ref) return;
    void persist(conversationId, pick.ref);
  }, [conversationId, hasStoredModel, persist, pick.ref]);

  return useMemo(
    () => ({
      modelRef: pick.ref,
      unavailableModel: pick.unavailable,
      resolved,
      target,
      options,
      selectModel,
      loadError: error,
    }),
    [error, options, pick, resolved, selectModel, target],
  );
}

export type ConversationModel = ReturnType<typeof useConversationModel>;

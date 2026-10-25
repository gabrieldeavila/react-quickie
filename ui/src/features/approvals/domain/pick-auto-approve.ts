type PickInput = {
  /** The active conversation, if one exists yet. */
  conversationId: string | null | undefined;
  /** `conversations.autoApprove`; undefined means off. */
  stored?: boolean;
  /** The toggle before the first message creates the conversation. */
  draft: boolean;
};

/** Auto mode is per conversation and off unless turned on in it. */
export function pickAutoApprove({
  conversationId,
  stored,
  draft,
}: PickInput): boolean {
  return conversationId ? stored === true : draft;
}

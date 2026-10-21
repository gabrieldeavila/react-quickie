type PickInput = {
  /** `conversations.instructionIds`; undefined until the conversation adopts a selection. */
  stored?: string[];
  /** The last selection used in this project (localStorage). */
  lastUsed: string[];
};

/** Stored selection → (new conversation) the last one used in the project. */
export function pickConversationInstructions({
  stored,
  lastUsed,
}: PickInput): string[] {
  return stored ?? lastUsed;
}

import type { UIMessage } from "@ai-sdk/react";

export type ChatMessageListProps = {
  messages: UIMessage[];
  isPending: boolean;
};

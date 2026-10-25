import type { UIMessage } from "ai";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  /** `provider:model` this conversation runs on (Dexie v4). */
  model?: string;
  /** Instruction ids selected for this conversation (Dexie v5). */
  instructionIds?: string[];
  /** Auto mode is on for this conversation (Dexie v6). */
  autoApprove?: boolean;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
}

/** Fields a new conversation may start with. */
export type NewConversationFields = Pick<ChatConversation, "autoApprove">;

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
  tokens?: number;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
  parts?: UIMessage["parts"];
}

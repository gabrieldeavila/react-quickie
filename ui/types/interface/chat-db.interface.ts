export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
}

export interface ChatMessageRecord {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
  tokens?: number;
  metadata?: Record<string, unknown>;
  attachments?: unknown[];
}

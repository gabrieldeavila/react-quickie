import type { UIMessage } from "@ai-sdk/react";
import type { CombinedAgentEnum } from "../enum/agent.enum";

export interface ChatRequestMessagePart {
  type: string;
  text?: string;
  mediaType?: string;
  filename?: string;
  url?: string;
  [key: string]: unknown;
}

export interface ChatRequestMessage {
  id?: string;
  role: string;
  content?: string;
  parts?: ChatRequestMessagePart[];
  [key: string]: unknown;
}

export interface ChatRequestBody {
  messages?: ChatRequestMessage[];
}

export type ChatMessageItemProps = {
  message: UIMessage;
  isTyping?: boolean;
  /** The last message in the chat; only it can still answer tool approvals. */
  isLatest?: boolean;
};

export type ToolStatus = "loading" | "success" | "error";

export type ToolStatusIconProps = {
  status: ToolStatus;
};

export type ToolCallCardProps = {
  label: string;
  status: ToolStatus;
  outputText?: string;
  /** Set when the card's file can be opened in the editor (VSCode). */
  onOpenFile?: () => void;
};

export type UserMessageContentProps = {
  text: string;
  images?: Array<{ url: string; filename?: string }>;
};

export type AssistantMarkdownProps = {
  text: string;
};

export type ProjectContext = {
  reference: string;
  focus: CombinedAgentEnum;
  specialty: string;
};

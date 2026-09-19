import type { UIMessage } from "@ai-sdk/react";
import type { CombinedAgentEnum } from "../enum/agent.enum";

export interface ChatMessagePayload {
  role: string;
  content: string;
}

export interface ChatRequestMessagePart {
  type: string;
  text?: string;
}

export interface ChatRequestMessage {
  role: string;
  content?: string;
  parts?: ChatRequestMessagePart[];
}

export interface ChatRequestBody {
  messages?: ChatRequestMessage[];
}

export type ChatMessageItemProps = {
  message: UIMessage;
  isTyping?: boolean;
};

export type ToolStatus = "loading" | "success" | "error";

export type ToolStatusIconProps = {
  status: ToolStatus;
};

export type ToolCallCardProps = {
  label: string;
  status: ToolStatus;
  outputText?: string;
};

export type UserMessageContentProps = {
  text: string;
};

export type AssistantMarkdownProps = {
  text: string;
};

export type ProjectContext = {
  reference: string;
  focus: CombinedAgentEnum;
  specialty: string;
  planningModeEnabled: boolean;
};

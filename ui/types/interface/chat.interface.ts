import type { UIMessage } from "@ai-sdk/react";
import type { AgentFocusEnum, AgentSpecialtyEnum } from "../enum/agent.enum";


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

export type ProjectContext = {
  reference: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
  planningModeEnabled: boolean;
};

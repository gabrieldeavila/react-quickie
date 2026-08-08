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

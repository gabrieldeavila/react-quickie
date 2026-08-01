import { DefaultChatTransport } from "ai";
import type { AgentFocusEnum, AgentSpecialtyEnum } from "../../enum/agent.enum";

type ChatMessagePayload = {
  role: string;
  content: string;
};

type ChatRequestBody = {
  messages?: Array<{
    role: string;
    content?: string;
    parts?: Array<{ type: string; text?: string }>;
  }>;
};

type CreateChatTransportParams = {
  projectRoot: string;
  focus: AgentFocusEnum;
  specialty: AgentSpecialtyEnum;
};

function normalizeMessage(
  message: NonNullable<ChatRequestBody["messages"]>[number],
): ChatMessagePayload {
  let contentText = message.content ?? "";
  if (!contentText && message.parts?.length) {
    contentText = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n");
  }
  return { role: message.role, content: contentText };
}

export function createChatTransport({
  projectRoot,
  focus,
  specialty,
}: CreateChatTransportParams) {
  return new DefaultChatTransport({
    api: "http://localhost:3000/chat",
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody & {
          root?: string;
          chatMode?: AgentFocusEnum;
          chatSpecialty?: AgentSpecialtyEnum;
        };
        if (body.messages) body.messages = body.messages.map(normalizeMessage);
        body.root = projectRoot;
        body.chatMode = focus;
        body.chatSpecialty = specialty;
        options.body = JSON.stringify(body);
      }
      return fetch(url, options);
    },
  });
}

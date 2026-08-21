import { DefaultChatTransport } from "ai";
import type {
  AgentSpecialtyEnum,
  CombinedAgentEnum
} from "../../types/enum/agent.enum";
import type {
  ChatMessagePayload,
  ChatRequestBody,
} from "../../types/interface/chat.interface";
import type { CreateChatTransportParams } from "../../types/interface/transport.interface";

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
  planningModeEnabled,
}: CreateChatTransportParams) {
  return new DefaultChatTransport({
    api: "http://localhost:3000/chat",
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody & {
          root?: string;
          chatMode?: CombinedAgentEnum;
          chatSpecialty?: AgentSpecialtyEnum;
          planningModeEnabled?: boolean;
        };
        if (body.messages) body.messages = body.messages.map(normalizeMessage);
        body.root = projectRoot;
        body.chatMode = focus;
        body.chatSpecialty = specialty;
        body.planningModeEnabled = planningModeEnabled;
        options.body = JSON.stringify(body);
      }
      return fetch(url, options);
    },
  });
}

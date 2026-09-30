import { DefaultChatTransport } from "ai";
import type { CombinedAgentEnum } from "../../types/enum/agent.enum";
import type {
  ChatRequestBody,
  ChatRequestMessage,
} from "../../types/interface/chat.interface";
import type { CreateChatTransportParams } from "../../types/interface/transport.interface";
import { CHAT_API_URL } from "~types/consts/project.const";

function normalizeMessage(
  message: NonNullable<ChatRequestBody["messages"]>[number],
): ChatRequestMessage | undefined {
  const sourceParts = message.parts?.length
    ? message.parts
    : message.content
      ? [{ type: "text", text: message.content }]
      : [];
  const parts = sourceParts.filter(
    (part) =>
      part.type === "text" ||
      (part.type === "file" && part.mediaType?.startsWith("image/")),
  );

  // useChat can keep empty assistant placeholders after interrupted/failed turns.
  // They are UI state, not conversation content, and the API rejects empty messages.
  if (parts.length === 0) return undefined;

  return { role: message.role, parts };
}

export function createChatTransport({
  projectRoot,
  focus,
  specialty,
}: CreateChatTransportParams) {
  return new DefaultChatTransport({
    api: CHAT_API_URL,
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody & {
          root?: string;
          chatMode?: CombinedAgentEnum;
          chatSpecialty?: string;
        };
        if (body.messages) {
          body.messages = body.messages.flatMap((message) => {
            const normalizedMessage = normalizeMessage(message);
            return normalizedMessage ? [normalizedMessage] : [];
          });
        }
        body.root = projectRoot;
        body.chatMode = focus;
        body.chatSpecialty = specialty;
        options.body = JSON.stringify(body);
      }
      return fetch(url, options);
    },
  });
}

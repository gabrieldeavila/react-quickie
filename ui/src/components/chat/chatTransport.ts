import { DefaultChatTransport } from "ai";

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

function normalizeMessage(message: ChatRequestBody["messages"][number]): ChatMessagePayload {
  let contentText = message.content ?? "";

  if (!contentText && message.parts?.length) {
    contentText = message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n");
  }

  return {
    role: message.role,
    content: contentText,
  };
}

export function createChatTransport() {
  return new DefaultChatTransport({
    api: "http://localhost:3000/chat",
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody;

        if (body.messages) {
          body.messages = body.messages.map(normalizeMessage);
        }

        options.body = JSON.stringify(body);
      }

      return fetch(url, options);
    },
  });
}

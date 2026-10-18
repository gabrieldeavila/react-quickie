import { DefaultChatTransport } from "ai";
import type { CombinedAgentEnum } from "../../types/enum/agent.enum";
import type { ChatRequestBody } from "../../types/interface/chat.interface";
import type { CreateChatTransportParams } from "../../types/interface/transport.interface";
import { CHAT_API_URL } from "~types/consts/project.const";
import { buildRequestMessages } from "@/features/chat/domain/build-request-messages";
import { truncateToolOutputs } from "@/features/chat/domain/truncate-tool-outputs";

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
          body.messages = truncateToolOutputs(
            buildRequestMessages(body.messages),
          );
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

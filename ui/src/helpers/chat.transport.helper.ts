import { DefaultChatTransport } from "ai";
import type { CombinedAgentEnum } from "../../types/enum/agent.enum";
import type { ChatRequestBody } from "../../types/interface/chat.interface";
import type { CreateChatTransportParams } from "../../types/interface/transport.interface";
import { getChatApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import { buildRequestMessages } from "@/features/chat/domain/build-request-messages";
import { truncateToolOutputs } from "@/features/chat/domain/truncate-tool-outputs";
import { filterPartsByCapabilities } from "@/features/models/domain/filter-parts-by-capabilities";

export function createChatTransport({
  projectRoot,
  focus,
  specialty,
  model,
  modelTarget,
}: CreateChatTransportParams) {
  return new DefaultChatTransport({
    api: getChatApiUrl(),
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody & {
          root?: string;
          chatMode?: CombinedAgentEnum;
          chatSpecialty?: string;
          model?: string;
        };
        if (body.messages) {
          const messages = buildRequestMessages(body.messages);
          body.messages = truncateToolOutputs(
            modelTarget
              ? filterPartsByCapabilities(messages, modelTarget)
              : messages,
          );
        }
        if (model) body.model = model;
        body.root = projectRoot;
        body.chatMode = focus;
        body.chatSpecialty = specialty;
        options.body = JSON.stringify(body);
      }
      return authFetch(url, options);
    },
  });
}

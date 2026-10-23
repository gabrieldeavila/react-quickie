import { DefaultChatTransport } from "ai";
import type { ChatRequestBody } from "../../types/interface/chat.interface";
import type { CreateChatTransportParams } from "../../types/interface/transport.interface";
import { getChatApiUrl } from "~types/consts/project.const";
import { authFetch } from "@/host/api/auth-fetch";
import { applyCompaction } from "@/features/chat/domain/apply-compaction";
import { buildRequestMessages } from "@/features/chat/domain/build-request-messages";
import { truncateToolOutputs } from "@/features/chat/domain/truncate-tool-outputs";
import { filterPartsByCapabilities } from "@/features/models/domain/filter-parts-by-capabilities";

export function createChatTransport({
  projectRoot,
  instructionIds,
  model,
  modelTarget,
  autoApprove,
}: CreateChatTransportParams) {
  return new DefaultChatTransport({
    api: getChatApiUrl(),
    fetch: (url, options) => {
      if (options?.body) {
        const body = JSON.parse(options.body as string) as ChatRequestBody & {
          root?: string;
          instructions?: string[];
          model?: string;
          compaction?: unknown;
          autoApprove?: boolean;
        };
        if (body.messages) {
          // Before buildRequestMessages, which drops the data-compaction part.
          const compacted = applyCompaction(body.messages);
          if (compacted.compaction) body.compaction = compacted.compaction;
          const messages = buildRequestMessages(compacted.messages);
          body.messages = truncateToolOutputs(
            modelTarget
              ? filterPartsByCapabilities(messages, modelTarget)
              : messages,
          );
        }
        if (model) body.model = model;
        body.root = projectRoot;
        body.instructions = instructionIds;
        body.autoApprove = autoApprove;
        options.body = JSON.stringify(body);
      }
      return authFetch(url, options);
    },
  });
}

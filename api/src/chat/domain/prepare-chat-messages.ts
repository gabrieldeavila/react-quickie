import {
  convertToModelMessages,
  safeValidateUIMessages,
  type ModelMessage,
  type ToolSet,
  type UIMessage,
} from 'ai';
import { closeDanglingToolCalls } from './close-dangling-tool-calls';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';
import { validateAttachments } from './validate-attachments';
import { validateMessageContent } from './validate-message-content';

const INVALID_MESSAGES = 'Não foi possível processar as mensagens enviadas.';
const NO_MESSAGES = 'Nenhuma mensagem válida encontrada na requisição.';

async function validateShape(
  raw: unknown,
  tools: ToolSet,
): Promise<UIMessage[]> {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new InvalidChatMessagesError(NO_MESSAGES);
  }
  const result = await safeValidateUIMessages<UIMessage>({
    messages: raw,
    // The SDK types this parameter narrower than ToolSet; runtime only reads inputSchema/outputSchema.
    tools: tools as Parameters<typeof safeValidateUIMessages>[0]['tools'],
  });
  if (!result.success) throw new InvalidChatMessagesError(INVALID_MESSAGES);
  return result.data;
}

async function toModelMessages(
  messages: UIMessage[],
  tools: ToolSet,
): Promise<ModelMessage[]> {
  try {
    return await convertToModelMessages(messages, { tools });
  } catch {
    throw new InvalidChatMessagesError(INVALID_MESSAGES);
  }
}

export type PreparedChatMessages = {
  /** Validated UI messages; passed to the stream as `originalMessages`. */
  uiMessages: UIMessage[];
  modelMessages: ModelMessage[];
};

/**
 * Request body → model messages: SDK shape validation, Doty's own content and
 * attachment rules, then closing tool calls that never got a result.
 */
export async function prepareChatMessages(
  raw: unknown,
  tools: ToolSet,
): Promise<PreparedChatMessages> {
  const shaped = await validateShape(raw, tools);
  validateMessageContent(shaped);
  const messages = closeDanglingToolCalls(validateAttachments(shaped));

  const modelMessages = await toModelMessages(messages, tools);
  if (modelMessages.length === 0) {
    throw new InvalidChatMessagesError(NO_MESSAGES);
  }
  return { uiMessages: messages, modelMessages };
}

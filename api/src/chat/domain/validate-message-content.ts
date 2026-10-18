import type { UIMessage } from 'ai';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';

const MAX_TEXT_LENGTH = 100_000;

/**
 * Rules the AI SDK schema does not enforce: clients may only send user and
 * assistant messages (never `system`), no message may be empty, and text
 * parts have a size cap.
 */
export function validateMessageContent(messages: UIMessage[]): void {
  messages.forEach((message, index) => {
    if (message.role !== 'user' && message.role !== 'assistant') {
      throw new InvalidChatMessagesError('Papel de mensagem inválido.');
    }
    if (message.parts.length === 0) {
      throw new InvalidChatMessagesError(`A mensagem ${index + 1} está vazia.`);
    }
    const hasLongText = message.parts.some(
      (part) => part.type === 'text' && part.text.length > MAX_TEXT_LENGTH,
    );
    if (hasLongText) {
      throw new InvalidChatMessagesError(
        'Texto da mensagem inválido ou muito longo.',
      );
    }
  });
}

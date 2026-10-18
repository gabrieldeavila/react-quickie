import type { FileUIPart, UIMessage } from 'ai';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_MESSAGE = 4;
const MAX_FILENAME_LENGTH = 255;
const DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]*={0,2})$/;

function base64Size(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function validateImage(part: FileUIPart): void {
  if (!ALLOWED_IMAGE_TYPES.has(part.mediaType)) {
    throw new InvalidChatMessagesError('Tipo ou conteúdo de imagem inválido.');
  }

  const match = DATA_URL_PATTERN.exec(part.url);
  if (!match || match[1] !== part.mediaType) {
    throw new InvalidChatMessagesError(
      'A imagem deve ser enviada como dado incorporado válido.',
    );
  }

  const size = base64Size(match[2]);
  if (size <= 0 || size > MAX_IMAGE_BYTES) {
    throw new InvalidChatMessagesError('Cada imagem deve ter até 5 MB.');
  }
}

function limitFilename(part: UIMessage['parts'][number]) {
  if (part.type !== 'file' || !part.filename) return part;
  return { ...part, filename: part.filename.slice(0, MAX_FILENAME_LENGTH) };
}

/**
 * File parts: user messages only, embedded images, 5 MB each, 4 per message.
 * Returns the messages with file names capped at 255 characters.
 */
export function validateAttachments(messages: UIMessage[]): UIMessage[] {
  for (const message of messages) {
    const files = message.parts.filter(
      (part): part is FileUIPart => part.type === 'file',
    );
    if (files.length === 0) continue;

    if (message.role !== 'user') {
      throw new InvalidChatMessagesError('Tipo de anexo não suportado.');
    }
    if (files.length > MAX_IMAGES_PER_MESSAGE) {
      throw new InvalidChatMessagesError(
        'Você pode enviar até 4 imagens por mensagem.',
      );
    }
    files.forEach(validateImage);
  }

  return messages.map((message) => ({
    ...message,
    parts: message.parts.map(limitFilename),
  }));
}

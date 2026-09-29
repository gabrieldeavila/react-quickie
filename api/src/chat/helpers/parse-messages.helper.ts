import { BadRequestException } from '@nestjs/common';
import type { UIMessage } from 'ai';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES_PER_MESSAGE = 4;
const MAX_TEXT_LENGTH = 100_000;

export function parseMessages(value: unknown): UIMessage[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BadRequestException(
      'Nenhuma mensagem válida encontrada na requisição.',
    );
  }

  return value.map((rawMessage, messageIndex) => {
    if (!rawMessage || typeof rawMessage !== 'object') {
      throw new BadRequestException('Formato de mensagem inválido.');
    }

    const message = rawMessage as Record<string, unknown>;
    if (message.role !== 'user' && message.role !== 'assistant') {
      throw new BadRequestException('Papel de mensagem inválido.');
    }
    if (!Array.isArray(message.parts)) {
      throw new BadRequestException('Partes da mensagem inválidas.');
    }

    let imageCount = 0;
    const parts = message.parts.map((rawPart) => {
      if (!rawPart || typeof rawPart !== 'object') {
        throw new BadRequestException('Parte da mensagem inválida.');
      }
      const part = rawPart as Record<string, unknown>;

      if (part.type === 'text') {
        if (
          typeof part.text !== 'string' ||
          part.text.length > MAX_TEXT_LENGTH
        ) {
          throw new BadRequestException(
            'Texto da mensagem inválido ou muito longo.',
          );
        }
        return { type: 'text' as const, text: part.text };
      }

      if (part.type !== 'file' || message.role !== 'user') {
        throw new BadRequestException('Tipo de anexo não suportado.');
      }

      imageCount += 1;
      if (imageCount > MAX_IMAGES_PER_MESSAGE) {
        throw new BadRequestException(
          'Você pode enviar até 4 imagens por mensagem.',
        );
      }
      if (
        typeof part.mediaType !== 'string' ||
        !ALLOWED_IMAGE_TYPES.has(part.mediaType) ||
        typeof part.url !== 'string'
      ) {
        throw new BadRequestException('Tipo ou conteúdo de imagem inválido.');
      }

      const dataUrlMatch =
        /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(
          part.url,
        );
      if (!dataUrlMatch || dataUrlMatch[1] !== part.mediaType) {
        throw new BadRequestException(
          'A imagem deve ser enviada como dado incorporado válido.',
        );
      }
      const base64 = dataUrlMatch[2];
      const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
      const imageSize = Math.floor((base64.length * 3) / 4) - padding;
      if (imageSize <= 0 || imageSize > MAX_IMAGE_BYTES) {
        throw new BadRequestException('Cada imagem deve ter até 5 MB.');
      }

      const filename =
        typeof part.filename === 'string'
          ? part.filename.slice(0, 255)
          : undefined;
      return {
        type: 'file' as const,
        mediaType: part.mediaType,
        url: part.url,
        ...(filename ? { filename } : {}),
      };
    });

    if (parts.length === 0) {
      throw new BadRequestException(
        `A mensagem ${messageIndex + 1} está vazia.`,
      );
    }

    return {
      id:
        typeof message.id === 'string' ? message.id : `request-${messageIndex}`,
      role: message.role,
      parts,
    };
  });
}

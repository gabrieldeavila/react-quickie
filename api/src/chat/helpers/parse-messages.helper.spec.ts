import { BadRequestException } from '@nestjs/common';
import { parseMessages } from './parse-messages.helper';

const pngDataUrl = (bytes: number) =>
  `data:image/png;base64,${Buffer.alloc(bytes, 1).toString('base64')}`;

const userText = (text: string, id = 'm1') => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

const imagePart = (url = pngDataUrl(10), mediaType = 'image/png') => ({
  type: 'file',
  mediaType,
  url,
});

describe('parseMessages', () => {
  it('rejects a missing or empty message list', () => {
    expect(() => parseMessages(undefined)).toThrow(BadRequestException);
    expect(() => parseMessages([])).toThrow(BadRequestException);
    expect(() => parseMessages('hi')).toThrow(BadRequestException);
  });

  it('keeps text messages from users and assistants', () => {
    const result = parseMessages([
      userText('hello'),
      { id: 'm2', role: 'assistant', parts: [{ type: 'text', text: 'hi' }] },
    ]);

    expect(result).toEqual([
      { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'hello' }] },
      { id: 'm2', role: 'assistant', parts: [{ type: 'text', text: 'hi' }] },
    ]);
  });

  it('strips unknown fields from text parts', () => {
    const [message] = parseMessages([
      { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'a', x: 1 }] },
    ]);

    expect(message.parts).toEqual([{ type: 'text', text: 'a' }]);
  });

  it('generates an id when the message has none', () => {
    const [message] = parseMessages([
      { role: 'user', parts: [{ type: 'text', text: 'a' }] },
    ]);

    expect(message.id).toBe('request-0');
  });

  it('rejects invalid roles, parts and empty messages', () => {
    expect(() =>
      parseMessages([{ role: 'system', parts: [{ type: 'text', text: 'a' }] }]),
    ).toThrow(BadRequestException);
    expect(() => parseMessages([{ role: 'user', parts: 'a' }])).toThrow(
      BadRequestException,
    );
    expect(() => parseMessages([{ role: 'user', parts: [] }])).toThrow(
      /mensagem 1 está vazia/,
    );
    expect(() => parseMessages([null])).toThrow(BadRequestException);
  });

  it('rejects text that is too long', () => {
    expect(() => parseMessages([userText('a'.repeat(100_001))])).toThrow(
      BadRequestException,
    );
  });

  it('rejects part types other than text and file (tool parts, for now)', () => {
    expect(() =>
      parseMessages([
        {
          role: 'assistant',
          parts: [{ type: 'tool-read_file', toolCallId: 't1' }],
        },
      ]),
    ).toThrow(/Tipo de anexo não suportado/);
  });

  describe('images', () => {
    it('accepts a valid data-URL image from the user', () => {
      const [message] = parseMessages([
        { role: 'user', parts: [{ ...imagePart(), filename: 'a.png' }] },
      ]);

      expect(message.parts[0]).toEqual({
        type: 'file',
        mediaType: 'image/png',
        url: pngDataUrl(10),
        filename: 'a.png',
      });
    });

    it('rejects images sent by the assistant', () => {
      expect(() =>
        parseMessages([{ role: 'assistant', parts: [imagePart()] }]),
      ).toThrow(BadRequestException);
    });

    it('rejects unsupported types and mismatched data URLs', () => {
      expect(() =>
        parseMessages([
          { role: 'user', parts: [imagePart(pngDataUrl(10), 'image/svg+xml')] },
        ]),
      ).toThrow(BadRequestException);
      expect(() =>
        parseMessages([
          { role: 'user', parts: [imagePart(pngDataUrl(10), 'image/jpeg')] },
        ]),
      ).toThrow(/dado incorporado válido/);
      expect(() =>
        parseMessages([
          { role: 'user', parts: [imagePart('https://x.test/a.png')] },
        ]),
      ).toThrow(/dado incorporado válido/);
    });

    it('rejects more than 4 images in one message', () => {
      const parts = Array.from({ length: 5 }, () => imagePart());

      expect(() => parseMessages([{ role: 'user', parts }])).toThrow(
        /até 4 imagens/,
      );
    });

    it('rejects images larger than 5 MB', () => {
      const tooBig = imagePart(pngDataUrl(5 * 1024 * 1024 + 1));

      expect(() => parseMessages([{ role: 'user', parts: [tooBig] }])).toThrow(
        /até 5 MB/,
      );
    });

    it('truncates long file names to 255 characters', () => {
      const [message] = parseMessages([
        {
          role: 'user',
          parts: [{ ...imagePart(), filename: 'a'.repeat(300) }],
        },
      ]);

      expect((message.parts[0] as { filename: string }).filename).toHaveLength(
        255,
      );
    });
  });
});

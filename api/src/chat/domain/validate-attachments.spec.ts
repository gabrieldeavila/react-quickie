import type { UIMessage } from 'ai';
import { InvalidChatMessagesError } from './invalid-chat-messages.error';
import { validateAttachments } from './validate-attachments';

const pngDataUrl = (bytes: number) =>
  `data:image/png;base64,${Buffer.alloc(bytes, 1).toString('base64')}`;

const imagePart = (url = pngDataUrl(10), mediaType = 'image/png') => ({
  type: 'file' as const,
  mediaType,
  url,
});

const message = (
  role: UIMessage['role'],
  parts: UIMessage['parts'],
): UIMessage => ({ id: 'm1', role, parts });

describe('validateAttachments', () => {
  it('accepts a valid data-URL image from the user', () => {
    const messages = [message('user', [{ ...imagePart(), filename: 'a.png' }])];

    expect(validateAttachments(messages)).toEqual(messages);
  });

  it('leaves messages without files untouched', () => {
    const messages = [message('assistant', [{ type: 'text', text: 'hi' }])];

    expect(validateAttachments(messages)).toEqual(messages);
  });

  it('rejects images sent by the assistant', () => {
    expect(() =>
      validateAttachments([message('assistant', [imagePart()])]),
    ).toThrow(InvalidChatMessagesError);
  });

  it('rejects unsupported types and mismatched or remote URLs', () => {
    expect(() =>
      validateAttachments([
        message('user', [imagePart(pngDataUrl(10), 'image/svg+xml')]),
      ]),
    ).toThrow(InvalidChatMessagesError);
    expect(() =>
      validateAttachments([
        message('user', [imagePart(pngDataUrl(10), 'image/jpeg')]),
      ]),
    ).toThrow(/valid embedded data/);
    expect(() =>
      validateAttachments([
        message('user', [imagePart('https://x.test/a.png')]),
      ]),
    ).toThrow(/valid embedded data/);
  });

  it('rejects more than 4 images in one message', () => {
    const parts = Array.from({ length: 5 }, () => imagePart());

    expect(() => validateAttachments([message('user', parts)])).toThrow(
      /up to 4 images/,
    );
  });

  it('rejects empty images and images larger than 5 MB', () => {
    expect(() =>
      validateAttachments([
        message('user', [imagePart('data:image/png;base64,')]),
      ]),
    ).toThrow(/5 MB or smaller/);
    expect(() =>
      validateAttachments([
        message('user', [imagePart(pngDataUrl(5 * 1024 * 1024 + 1))]),
      ]),
    ).toThrow(/5 MB or smaller/);
  });

  it('truncates long file names to 255 characters', () => {
    const [result] = validateAttachments([
      message('user', [{ ...imagePart(), filename: 'a'.repeat(300) }]),
    ]);

    expect((result.parts[0] as { filename: string }).filename).toHaveLength(
      255,
    );
  });
});

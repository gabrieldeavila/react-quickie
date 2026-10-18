import { capMcpToolResult } from './cap-mcp-tool-result';

const text = (value: string) => ({ type: 'text', text: value });

describe('capMcpToolResult', () => {
  it('returns small results unchanged', () => {
    const result = { content: [text('ok')], isError: false };
    expect(capMcpToolResult(result, 10)).toBe(result);
  });

  it('truncates text across parts, keeps the shape and marks it truncated', () => {
    const capped = capMcpToolResult(
      {
        content: [text('aaaa'), text('bbbbbb'), text('cccc')],
        structuredContent: { big: true },
        isError: false,
      },
      7,
    );

    expect(capped).toEqual({
      content: [
        text('aaaa'),
        text('bbb'),
        text('\n[output truncated: 7 of 14 characters]'),
      ],
      isError: false,
      truncated: true,
      originalSize: 14,
    });
  });

  it('does not count images against the budget', () => {
    const image = {
      type: 'image',
      data: 'x'.repeat(100),
      mimeType: 'image/png',
    };
    const result = { content: [image, text('hi')] };
    expect(capMcpToolResult(result, 5)).toBe(result);
  });

  it('drops non-text parts that do not fit', () => {
    const resource = { type: 'resource', resource: { text: 'z'.repeat(50) } };
    const capped = capMcpToolResult(
      { content: [text('ab'), resource] },
      10,
    ) as { content: unknown[]; truncated: boolean };

    expect(capped.truncated).toBe(true);
    expect(capped.content[0]).toEqual(text('ab'));
    expect(capped.content).not.toContainEqual(resource);
  });

  it('turns an oversized structured value into a preview', () => {
    expect(capMcpToolResult({ rows: 'r'.repeat(20) }, 10)).toEqual({
      truncated: true,
      preview: '{"rows":"r',
      originalSize: 31,
    });
  });

  it('passes through undefined and small structured values', () => {
    expect(capMcpToolResult(undefined, 10)).toBeUndefined();
    expect(capMcpToolResult({ a: 1 }, 10)).toEqual({ a: 1 });
  });
});

import type { Tool } from 'ai';
import { readMcpAnnotations, withMcpAnnotations } from './mcp-tool-annotations';

const tool = { description: 'x' } as Tool;

describe('withMcpAnnotations', () => {
  it('keeps only the boolean behaviour hints of each definition', () => {
    const tools = withMcpAnnotations({ read: tool, write: tool }, [
      {
        name: 'read',
        annotations: { title: 'Read', readOnlyHint: true, openWorldHint: 'x' },
      },
      { name: 'write' },
    ]);

    expect(readMcpAnnotations(tools.read)).toEqual({ readOnlyHint: true });
    expect(readMcpAnnotations(tools.write)).toBeUndefined();
  });

  it('survives the wrappers that spread the tool', () => {
    const [annotated] = Object.values(
      withMcpAnnotations({ read: tool }, [
        { name: 'read', annotations: { readOnlyHint: true } },
      ]),
    );
    expect(readMcpAnnotations({ ...annotated, strict: false } as Tool)).toEqual(
      {
        readOnlyHint: true,
      },
    );
  });
});

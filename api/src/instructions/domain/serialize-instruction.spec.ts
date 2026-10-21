import { parseInstruction } from './parse-instruction';
import { serializeInstruction } from './serialize-instruction';

describe('serializeInstruction', () => {
  it('writes frontmatter and body that parse back to the same input', () => {
    const input = {
      name: 'API: conventions',
      description: 'How our "REST" API is shaped.',
      starters: ['Add an endpoint', 'Review: this controller'],
      content: '# Rules\n\n- Use DTOs.',
    };

    const text = serializeInstruction(input);

    expect(text.startsWith('---\nname:')).toBe(true);
    expect(parseInstruction(text, 'api', 'project')).toEqual({
      ...input,
      id: 'api',
      source: 'project',
    });
  });

  it('leaves out an empty description and starters', () => {
    const text = serializeInstruction({
      name: 'Notes',
      description: '',
      starters: [],
      content: 'Body.',
    });

    expect(text).toBe('---\nname: Notes\n---\nBody.\n');
  });
});

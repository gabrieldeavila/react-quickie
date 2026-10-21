import { TRUNCATION_NOTICE } from './cap-instruction-content';
import { MAX_INSTRUCTION_BYTES } from './instruction-limits';
import { InvalidInstructionError, parseInstruction } from './parse-instruction';

describe('parseInstruction', () => {
  it('reads the frontmatter and the body', () => {
    const raw = [
      '---',
      'name: Landing pages',
      'description: Conversion-focused landing pages.',
      'starters:',
      '  - Build a landing page for a SaaS product',
      '---',
      '',
      'Guidance here.',
      '',
    ].join('\n');

    expect(parseInstruction(raw, 'landing-pages', 'built-in')).toEqual({
      id: 'landing-pages',
      name: 'Landing pages',
      description: 'Conversion-focused landing pages.',
      starters: ['Build a landing page for a SaaS product'],
      content: 'Guidance here.',
      source: 'built-in',
    });
  });

  it('falls back to the id without a name and works without frontmatter', () => {
    expect(parseInstruction('Just a body.', 'notes', 'project')).toEqual({
      id: 'notes',
      name: 'notes',
      description: '',
      starters: [],
      content: 'Just a body.',
      source: 'project',
    });
  });

  it('drops invalid starters', () => {
    const list = parseInstruction(
      '---\nstarters:\n  - ok\n  - 3\n  - ""\n  - { a: 1 }\n---\nx',
      'a',
      'global',
    );
    expect(list.starters).toEqual(['ok']);

    const notAList = parseInstruction(
      '---\nstarters: hello\n---\nx',
      'a',
      'global',
    );
    expect(notAList.starters).toEqual([]);
  });

  it('truncates an oversized body', () => {
    const raw = `---\nname: Big\n---\n${'x'.repeat(MAX_INSTRUCTION_BYTES + 10)}`;
    const { content } = parseInstruction(raw, 'big', 'global');

    expect(content.endsWith(TRUNCATION_NOTICE)).toBe(true);
  });

  it('rejects frontmatter that is not valid YAML', () => {
    expect(() =>
      parseInstruction('---\nname: [unclosed\n---\nx', 'a', 'global'),
    ).toThrow(InvalidInstructionError);
  });
});

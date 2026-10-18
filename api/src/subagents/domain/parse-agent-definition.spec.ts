import * as fs from 'fs';
import * as path from 'path';
import {
  DEFAULT_MAX_STEPS,
  InvalidAgentDefinitionError,
  parseAgentDefinition,
} from './parse-agent-definition';

const file = (frontmatter: string, body = 'You are an agent.') =>
  `---\n${frontmatter}\n---\n${body}\n`;

describe('parseAgentDefinition', () => {
  it('reads every frontmatter field and the prompt body', () => {
    const definition = parseAgentDefinition(
      file(
        [
          'name: explorer',
          'description: Finds code.',
          'tools: [read_file, "mcp__github__*"]',
          'model: anthropic:claude-haiku-5-5',
          'maxSteps: 7',
          'writes: true',
        ].join('\n'),
        '  Look around.  ',
      ),
      'project',
    );

    expect(definition).toEqual({
      name: 'explorer',
      description: 'Finds code.',
      tools: ['read_file', 'mcp__github__*'],
      model: 'anthropic:claude-haiku-5-5',
      maxSteps: 7,
      writes: true,
      instructions: 'Look around.',
      source: 'project',
    });
  });

  it('applies defaults and treats model: inherit as no model', () => {
    const definition = parseAgentDefinition(
      file('name: a\ndescription: d\nmodel: inherit'),
      'built-in',
    );

    expect(definition.model).toBeUndefined();
    expect(definition.tools).toEqual([]);
    expect(definition.maxSteps).toBe(DEFAULT_MAX_STEPS);
    expect(definition.writes).toBe(false);
  });

  it.each([
    ['a missing name', 'description: d'],
    ['an invalid name', 'name: Has Spaces\ndescription: d'],
    ['a missing description', 'name: a'],
    ['a non-boolean writes', 'name: a\ndescription: d\nwrites: "yes"'],
    ['too many steps', 'name: a\ndescription: d\nmaxSteps: 500'],
    ['tools that are not a list', 'name: a\ndescription: d\ntools: read_file'],
  ])('rejects %s', (_label, frontmatter) => {
    expect(() => parseAgentDefinition(file(frontmatter), 'project')).toThrow(
      InvalidAgentDefinitionError,
    );
  });

  it('rejects an empty prompt body', () => {
    expect(() =>
      parseAgentDefinition(file('name: a\ndescription: d', '   '), 'project'),
    ).toThrow('the prompt body is empty');
  });

  it('rejects broken YAML', () => {
    expect(() =>
      parseAgentDefinition(file('name: [unclosed'), 'project'),
    ).toThrow(InvalidAgentDefinitionError);
  });

  it('parses the shipped built-in agents', () => {
    const dir = path.join(__dirname, '..', 'definitions');
    const definitions = fs
      .readdirSync(dir)
      .map((name) =>
        parseAgentDefinition(
          fs.readFileSync(path.join(dir, name), 'utf8'),
          'built-in',
        ),
      );

    expect(definitions.map(({ name, writes }) => ({ name, writes }))).toEqual([
      { name: 'explorer', writes: false },
      { name: 'implementer', writes: true },
      { name: 'reviewer', writes: false },
    ]);
  });
});

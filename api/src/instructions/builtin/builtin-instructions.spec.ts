import * as fs from 'fs';
import * as path from 'path';
import { TRUNCATION_NOTICE } from '../domain/cap-instruction-content';
import { parseInstruction } from '../domain/parse-instruction';
import { isValidInstructionId } from '../domain/validate-instruction-id';

const files = fs.readdirSync(__dirname).filter((name) => name.endsWith('.md'));

describe('built-in instructions', () => {
  it('ships the converted skills', () => {
    expect(files.sort()).toEqual([
      'backend-architecture.md',
      'clean-architecture.md',
      'react-architecture.md',
      'refactoring.md',
    ]);
  });

  it.each(files)('%s is complete and short', (file) => {
    const id = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(__dirname, file), 'utf8');
    const instruction = parseInstruction(raw, id, 'built-in');

    expect(isValidInstructionId(id)).toBe(true);
    expect(instruction.name).not.toBe(id);
    expect(instruction.description).not.toBe('');
    expect(instruction.starters.length).toBeGreaterThan(0);
    expect(instruction.content).not.toContain(TRUNCATION_NOTICE);
    expect(raw.split('\n').length).toBeLessThanOrEqual(80);
    expect(raw).not.toMatch(/Quality Gate/i);
  });
});

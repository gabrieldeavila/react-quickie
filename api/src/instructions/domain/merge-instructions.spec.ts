import type { Instruction, InstructionSource } from './instruction.types';
import { mergeInstructions } from './merge-instructions';

const make = (
  id: string,
  source: InstructionSource,
  name = id,
): Instruction => ({
  id,
  name,
  description: '',
  starters: [],
  content: `${id} from ${source}`,
  source,
});

describe('mergeInstructions', () => {
  it('lets project override global, and global override built-in', () => {
    const merged = mergeInstructions(
      [make('forms', 'built-in'), make('landing-pages', 'built-in')],
      [make('forms', 'global'), make('api', 'global')],
      [make('api', 'project')],
    );

    expect(merged.map(({ id, source }) => [id, source])).toEqual([
      ['api', 'project'],
      ['forms', 'global'],
      ['landing-pages', 'built-in'],
    ]);
  });

  it('sorts by name, then id', () => {
    const merged = mergeInstructions(
      [make('b', 'built-in', 'Same'), make('a', 'built-in', 'Same')],
      [make('z', 'global', 'Alpha')],
      [],
    );

    expect(merged.map(({ id }) => id)).toEqual(['z', 'a', 'b']);
  });
});

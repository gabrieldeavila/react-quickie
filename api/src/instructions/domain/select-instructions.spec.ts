import type { Instruction } from './instruction.types';
import { selectInstructions } from './select-instructions';

const make = (id: string): Instruction => ({
  id,
  name: id,
  description: '',
  starters: [],
  content: id,
  source: 'built-in',
});

const available = ['a', 'b', 'c', 'd'].map(make);
const ids = (items: Instruction[]) => items.map(({ id }) => id);

describe('selectInstructions', () => {
  it('keeps the requested order and drops duplicates', () => {
    const { selected } = selectInstructions(available, ['c', 'a', 'c']);

    expect(ids(selected)).toEqual(['c', 'a']);
  });

  it('reports unknown ids', () => {
    const { selected, unknownIds } = selectInstructions(available, [
      'a',
      'gone',
      'nope',
    ]);

    expect(ids(selected)).toEqual(['a']);
    expect(unknownIds).toEqual(['gone', 'nope']);
  });

  it('stops at the limit', () => {
    const { selected } = selectInstructions(available, ['a', 'b', 'c', 'd'], 2);

    expect(ids(selected)).toEqual(['a', 'b']);
  });
});

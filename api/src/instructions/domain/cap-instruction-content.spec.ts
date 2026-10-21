import {
  capInstructionContent,
  TRUNCATION_NOTICE,
} from './cap-instruction-content';

describe('capInstructionContent', () => {
  it('keeps a body within the limit', () => {
    expect(capInstructionContent('short', 10)).toBe('short');
    expect(capInstructionContent('x'.repeat(10), 10)).toBe('x'.repeat(10));
  });

  it('cuts a longer body and adds the notice', () => {
    expect(capInstructionContent('abcdefghijkl', 5)).toBe(
      `abcde\n\n${TRUNCATION_NOTICE}`,
    );
  });

  it('never leaves half a multi-byte character', () => {
    // "é" is two bytes: a 3-byte cut of "aéé" keeps only "aé".
    expect(capInstructionContent('aéé', 3)).toBe(`aé\n\n${TRUNCATION_NOTICE}`);
    expect(capInstructionContent('aéé', 4)).toBe(`aé\n\n${TRUNCATION_NOTICE}`);
  });
});

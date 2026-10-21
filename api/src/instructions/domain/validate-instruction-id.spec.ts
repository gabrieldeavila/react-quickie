import { isValidInstructionId } from './validate-instruction-id';

describe('isValidInstructionId', () => {
  it('accepts lowercase letters, digits and dashes', () => {
    for (const id of [
      'forms',
      'landing-pages',
      'a',
      '9-lives',
      'x'.repeat(64),
    ]) {
      expect(isValidInstructionId(id)).toBe(true);
    }
  });

  it('rejects anything that could escape the folder or is malformed', () => {
    for (const id of [
      '',
      '-forms',
      'Forms',
      'landing_pages',
      'a b',
      '../etc',
      'a/b',
      'forms.md',
      'x'.repeat(65),
    ]) {
      expect(isValidInstructionId(id)).toBe(false);
    }
  });
});

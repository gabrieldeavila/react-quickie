import { MAX_INSTRUCTION_BYTES, MAX_STARTERS } from './instruction-limits';
import {
  InvalidInstructionInputError,
  validateInstructionInput,
} from './validate-instruction-input';

describe('validateInstructionInput', () => {
  it('trims the fields and fills defaults', () => {
    expect(
      validateInstructionInput({ name: ' Forms ', content: ' Use Zod. ' }),
    ).toEqual({
      name: 'Forms',
      description: '',
      starters: [],
      content: 'Use Zod.',
    });
  });

  it('keeps description and starters', () => {
    expect(
      validateInstructionInput({
        name: 'Forms',
        description: 'Typed forms.',
        starters: ['Build a signup form'],
        content: 'Use Zod.',
      }),
    ).toMatchObject({
      description: 'Typed forms.',
      starters: ['Build a signup form'],
    });
  });

  it.each([
    ['no name', { content: 'x' }, /name/],
    ['blank name', { name: ' ', content: 'x' }, /name is required/],
    ['no content', { name: 'A' }, /content/],
    [
      'too many starters',
      { name: 'A', content: 'x', starters: Array(MAX_STARTERS + 1).fill('s') },
      /starters/,
    ],
    [
      'oversized content',
      { name: 'A', content: 'x'.repeat(MAX_INSTRUCTION_BYTES + 1) },
      /longer than 20 KB/,
    ],
    ['not an object', 'text', /body/],
  ])('rejects %s', (_label, body, message) => {
    expect(() => validateInstructionInput(body)).toThrow(
      InvalidInstructionInputError,
    );
    expect(() => validateInstructionInput(body)).toThrow(message);
  });
});

import { formatInstructionMessage } from './format-instruction-message';

describe('formatInstructionMessage', () => {
  it('heads the body with the instruction name', () => {
    expect(
      formatInstructionMessage({
        id: 'forms',
        name: 'Forms',
        description: '',
        starters: [],
        content: 'Use Zod.',
        source: 'built-in',
      }),
    ).toEqual({
      role: 'system',
      content: 'Instruction "Forms" (selected by the user):\n\nUse Zod.',
    });
  });
});

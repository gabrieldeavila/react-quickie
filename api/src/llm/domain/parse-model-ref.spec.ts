import {
  formatModelRef,
  InvalidModelRefError,
  parseModelRef,
} from './parse-model-ref';

describe('parseModelRef', () => {
  it('splits provider and model', () => {
    expect(parseModelRef('anthropic:claude-sonnet-5-5')).toEqual({
      provider: 'anthropic',
      model: 'claude-sonnet-5-5',
    });
  });

  it('keeps colons inside the model id', () => {
    expect(parseModelRef('openai-compatible:llama3.3:70b')).toEqual({
      provider: 'openai-compatible',
      model: 'llama3.3:70b',
    });
  });

  it('trims both parts', () => {
    expect(formatModelRef(parseModelRef(' openai : gpt-6.1-sol '))).toBe(
      'openai:gpt-6.1-sol',
    );
  });

  it.each([
    '',
    'claude-sonnet-5-5',
    ':gpt',
    'openai:',
    'openai:  ',
    'mistral:large',
  ])('rejects %p', (ref) => {
    expect(() => parseModelRef(ref)).toThrow(InvalidModelRefError);
  });
});

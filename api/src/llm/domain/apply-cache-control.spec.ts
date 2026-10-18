import type { ModelMessage, SystemModelMessage } from 'ai';
import { applyCacheControl } from './apply-cache-control';

const EPHEMERAL = { anthropic: { cacheControl: { type: 'ephemeral' } } };

const user = (text: string): ModelMessage => ({ role: 'user', content: text });

describe('applyCacheControl', () => {
  it('marks the last system instruction and the last message', () => {
    const result = applyCacheControl({
      instructions: [
        { role: 'system', content: 'a' },
        { role: 'system', content: 'b' },
      ],
      messages: [user('1'), user('2')],
    });
    const system = result.instructions as SystemModelMessage[];

    expect(system[0].providerOptions).toBeUndefined();
    expect(system[1].providerOptions).toEqual(EPHEMERAL);
    expect(result.messages[0].providerOptions).toBeUndefined();
    expect(result.messages[1].providerOptions).toEqual(EPHEMERAL);
  });

  it('turns string instructions into a marked system message', () => {
    const result = applyCacheControl({ instructions: 'rules', messages: [] });

    expect(result.instructions).toEqual([
      { role: 'system', content: 'rules', providerOptions: EPHEMERAL },
    ]);
  });

  it('moves the message breakpoint to the new last message on later steps', () => {
    const step1 = applyCacheControl({
      instructions: undefined,
      messages: [user('1')],
    });
    const step2 = applyCacheControl({
      instructions: undefined,
      messages: [...step1.messages, user('2')],
    });

    expect(step2.messages[0].providerOptions).toEqual({});
    expect(step2.messages[1].providerOptions).toEqual(EPHEMERAL);
  });

  it('keeps other provider options', () => {
    const message: ModelMessage = {
      role: 'user',
      content: 'x',
      providerOptions: {
        openai: { foo: 1 },
        anthropic: { other: true, cacheControl: { type: 'ephemeral' } },
      },
    };
    const result = applyCacheControl({
      instructions: undefined,
      messages: [message, user('y')],
    });

    expect(result.messages[0].providerOptions).toEqual({
      openai: { foo: 1 },
      anthropic: { other: true },
    });
  });
});

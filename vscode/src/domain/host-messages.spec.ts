import { describe, expect, it } from 'vitest';
import { parseWebviewMessage } from './host-messages';

describe('parseWebviewMessage', () => {
  it('reads ready and openFile messages', () => {
    expect(parseWebviewMessage({ type: 'ready' })).toEqual({ type: 'ready' });
    expect(parseWebviewMessage({ type: 'openFile', path: 'a.ts', line: 3, root: '/w' })).toEqual({
      type: 'openFile',
      path: 'a.ts',
      line: 3,
      root: '/w',
    });
  });

  it('drops invalid lines and roots', () => {
    expect(parseWebviewMessage({ type: 'openFile', path: 'a.ts', line: -1, root: 5 })).toEqual({
      type: 'openFile',
      path: 'a.ts',
      line: undefined,
      root: undefined,
    });
  });

  it('rejects unknown or malformed messages', () => {
    expect(parseWebviewMessage(null)).toBeNull();
    expect(parseWebviewMessage({ type: 'runBash', command: 'rm -rf /' })).toBeNull();
    expect(parseWebviewMessage({ type: 'openFile' })).toBeNull();
  });
});

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

  it('reads setTitle, trimmed and capped', () => {
    expect(parseWebviewMessage({ type: 'setTitle', title: '  Login form  ' })).toEqual({
      type: 'setTitle',
      title: 'Login form',
    });
    const long = parseWebviewMessage({ type: 'setTitle', title: 'x'.repeat(200) });
    expect(long).toEqual({ type: 'setTitle', title: 'x'.repeat(80) });
  });

  it('reads setFocus', () => {
    expect(parseWebviewMessage({ type: 'setFocus', focused: true })).toEqual({
      type: 'setFocus',
      focused: true,
    });
    expect(parseWebviewMessage({ type: 'setFocus', focused: false })).toEqual({
      type: 'setFocus',
      focused: false,
    });
  });

  it('reads openMcpConfig with a known scope only', () => {
    expect(parseWebviewMessage({ type: 'openMcpConfig', scope: 'project', root: '/w' })).toEqual({
      type: 'openMcpConfig',
      scope: 'project',
      root: '/w',
    });
    expect(parseWebviewMessage({ type: 'openMcpConfig', scope: 'global', root: 3 })).toEqual({
      type: 'openMcpConfig',
      scope: 'global',
      root: undefined,
    });
    expect(parseWebviewMessage({ type: 'openMcpConfig', scope: '/etc/passwd' })).toBeNull();
  });

  it('reads openExternal for web pages only', () => {
    expect(
      parseWebviewMessage({ type: 'openExternal', url: 'https://accounts.example.com/auth?x=1' }),
    ).toEqual({ type: 'openExternal', url: 'https://accounts.example.com/auth?x=1' });
    expect(parseWebviewMessage({ type: 'openExternal', url: 'command:workbench.action.reload' })).toBeNull();
    expect(parseWebviewMessage({ type: 'openExternal', url: 'file:///etc/passwd' })).toBeNull();
    expect(parseWebviewMessage({ type: 'openExternal', url: 'not a url' })).toBeNull();
    expect(parseWebviewMessage({ type: 'openExternal' })).toBeNull();
  });

  it('rejects unknown or malformed messages', () => {
    expect(parseWebviewMessage(null)).toBeNull();
    expect(parseWebviewMessage({ type: 'runBash', command: 'rm -rf /' })).toBeNull();
    expect(parseWebviewMessage({ type: 'openFile' })).toBeNull();
    expect(parseWebviewMessage({ type: 'setTitle', title: 3 })).toBeNull();
    expect(parseWebviewMessage({ type: 'setFocus', focused: 'yes' })).toBeNull();
  });
});

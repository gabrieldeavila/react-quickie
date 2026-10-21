import { resolveDotyClient } from './resolve-doty-client';

describe('resolveDotyClient', () => {
  it('is vscode only when set to vscode', () => {
    expect(resolveDotyClient('vscode')).toBe('vscode');
    expect(resolveDotyClient(' VSCode ')).toBe('vscode');
  });

  it('defaults to web', () => {
    expect(resolveDotyClient(undefined)).toBe('web');
    expect(resolveDotyClient('')).toBe('web');
    expect(resolveDotyClient('desktop')).toBe('web');
  });
});

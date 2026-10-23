import { normalizeCommand } from './normalize-command';

describe('normalizeCommand', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeCommand('  pnpm   --dir api\ttest ')).toBe(
      'pnpm --dir api test',
    );
  });

  it.each([
    'pnpm test; rm -rf x',
    'pnpm test && rm -rf x',
    'pnpm test || true',
    'pnpm test & sleep 1',
    'cat a | sh',
    'echo x > file',
    'sh < script',
    'echo `whoami`',
    'echo $(whoami)',
    'pnpm test\nrm -rf x',
  ])('refuses compound syntax: %s', (command) => {
    expect(normalizeCommand(command)).toBeUndefined();
  });

  it('refuses an empty command', () => {
    expect(normalizeCommand('   ')).toBeUndefined();
  });
});

import { assessCommand } from './command-policy';

const root = '/workspace/app';
const decide = (command: string) => assessCommand(command, root).decision;

describe('assessCommand', () => {
  describe('blocked', () => {
    it.each([
      'sudo ls',
      'ls && sudo rm -rf /',
      'echo ok; shutdown now',
      'reboot',
      'mkfs.ext4 /dev/sda',
      'dd if=/dev/zero of=disk.img',
    ])('blocks administrative command "%s"', (command) => {
      expect(decide(command)).toBe('blocked');
    });

    it.each(['cat /etc/passwd', 'ls /usr/local', 'ls ~/Library'])(
      'blocks global system folders in "%s"',
      (command) => {
        expect(decide(command)).toBe('blocked');
      },
    );

    it('explains why a command is blocked', () => {
      expect(assessCommand('sudo ls', root).reason).toEqual(expect.any(String));
    });
  });

  describe('approval required', () => {
    it.each([
      'rm -rf dist',
      'mv a b',
      'mkdir tmp',
      'git reset --hard',
      'git checkout main',
      'npm install left-pad',
      'pnpm add zod',
      'yarn remove zod',
      'curl https://example.com',
      'docker ps',
    ])('asks before mutating or network command "%s"', (command) => {
      expect(decide(command)).toBe('approval_required');
    });

    it.each([
      'echo hi > out.txt',
      'cat < in.txt',
      'echo $(whoami)',
      'echo `id`',
    ])('asks before redirects and nested execution in "%s"', (command) => {
      expect(decide(command)).toBe('approval_required');
    });

    it.each(['ls /tmp', 'cat /workspace/other/file', 'ls /workspace/app2'])(
      'asks before touching absolute paths outside the root in "%s"',
      (command) => {
        expect(decide(command)).toBe('approval_required');
      },
    );
  });

  describe('allowed', () => {
    it.each([
      'ls -la',
      'git status',
      'cat package.json | grep name',
      'npm test && echo done',
      'ls 2>/dev/null',
      'ls > /dev/null',
      'cat /workspace/app/package.json',
      'ls /workspace/app',
    ])('runs read-only workspace command "%s"', (command) => {
      expect(decide(command)).toBe('allowed');
    });

    it('trims surrounding whitespace', () => {
      expect(decide('   git log   ')).toBe('allowed');
    });
  });
});

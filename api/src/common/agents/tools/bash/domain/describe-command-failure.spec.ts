import { describeCommandFailure } from './describe-command-failure';

describe('describeCommandFailure', () => {
  it('gives the exit code with stdout and stderr', () => {
    expect(
      describeCommandFailure({
        message: 'Command failed: bash -lc npm test',
        code: 1,
        stdout: '✖ sums all values\n',
        stderr: 'npm error Test failed\n',
      }),
    ).toBe(
      'The command exited with code 1.\n\nstdout:\n✖ sums all values\n\n\nstderr:\nnpm error Test failed',
    );
  });

  it('leaves out empty streams', () => {
    expect(
      describeCommandFailure({ code: 2, stdout: '', stderr: 'boom' }),
    ).toBe('The command exited with code 2.\n\nstderr:\nboom');
  });

  it('says when the command was stopped', () => {
    expect(
      describeCommandFailure({
        killed: true,
        signal: 'SIGTERM',
        stdout: 'partial',
      }),
    ).toBe(
      'The command was stopped (SIGTERM), e.g. by the time limit.\n\nstdout:\npartial',
    );
  });

  it('says when the output was too large', () => {
    expect(
      describeCommandFailure({ code: 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' }),
    ).toBe('The output was too large and was cut.');
  });

  it('falls back to the error message', () => {
    expect(describeCommandFailure({ message: 'spawn bash ENOENT' })).toBe(
      'spawn bash ENOENT',
    );
  });
});

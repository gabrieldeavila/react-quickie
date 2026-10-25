import { describeConnectionCheck } from './describe-connection-check';

describe('describeConnectionCheck', () => {
  it('reports each outcome so the agent can relay it', () => {
    expect(
      describeConnectionCheck('drive', { status: 'connected', toolCount: 4 }),
    ).toMatch(/connected with 4 tool/);
    expect(
      describeConnectionCheck('drive', { status: 'needs-sign-in' }),
    ).toMatch(/click Sign in/);
    expect(
      describeConnectionCheck('drive', {
        status: 'error',
        error: 'Missing env var GOOGLE_DRIVE_CREDENTIALS_PATH',
      }),
    ).toMatch(/did not connect: Missing env var GOOGLE_DRIVE_CREDENTIALS_PATH/);
    expect(
      describeConnectionCheck('drive', {
        status: 'inactive',
        reason: 'it is disabled',
      }),
    ).toMatch(/not active: it is disabled/);
  });
});

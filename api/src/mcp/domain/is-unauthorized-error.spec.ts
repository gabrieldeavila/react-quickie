import { UnauthorizedError } from '@ai-sdk/mcp';
import { isUnauthorizedError } from './is-unauthorized-error';

describe('isUnauthorizedError', () => {
  it("recognizes the SDK's error, also as a cause", () => {
    expect(isUnauthorizedError(new UnauthorizedError())).toBe(true);
    expect(
      isUnauthorizedError(
        new Error('init failed', { cause: new UnauthorizedError() }),
      ),
    ).toBe(true);
  });

  it('ignores other failures', () => {
    expect(isUnauthorizedError(new Error('ECONNREFUSED'))).toBe(false);
    expect(isUnauthorizedError('nope')).toBe(false);
    expect(isUnauthorizedError(undefined)).toBe(false);
  });
});

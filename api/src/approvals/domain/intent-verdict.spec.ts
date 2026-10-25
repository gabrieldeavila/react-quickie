import { readIntentApproval } from './intent-verdict';

describe('readIntentApproval', () => {
  it('returns the reason of a yes', () => {
    expect(
      readIntentApproval({
        approve: true,
        reason: ' You asked to delete it. ',
      }),
    ).toBe('You asked to delete it.');
  });

  it.each([
    ['a no', { approve: false, reason: 'Not asked.' }],
    ['a yes without a reason', { approve: true, reason: '  ' }],
    ['a malformed answer', { approve: 'yes' }],
    ['nothing', undefined],
  ])('asks the user on %s', (_label, output) => {
    expect(readIntentApproval(output)).toBeUndefined();
  });
});

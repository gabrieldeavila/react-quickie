import { InvalidToolApprovalSignatureError } from 'ai';
import {
  APPROVAL_EXPIRED_MESSAGE,
  describeStreamError,
  GENERIC_STREAM_ERROR,
} from './describe-stream-error';

describe('describeStreamError', () => {
  it('explains an approval signed with another secret', () => {
    const error = new InvalidToolApprovalSignatureError({
      approvalId: 'ap-1',
      toolCallId: 'call-1',
      reason: 'invalid signature',
    });

    expect(describeStreamError(error)).toBe(APPROVAL_EXPIRED_MESSAGE);
  });

  it('falls back to the generic message', () => {
    expect(describeStreamError(new Error('boom'))).toBe(GENERIC_STREAM_ERROR);
    expect(describeStreamError(undefined)).toBe(GENERIC_STREAM_ERROR);
  });
});

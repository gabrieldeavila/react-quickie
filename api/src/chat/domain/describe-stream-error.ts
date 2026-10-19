import { InvalidToolApprovalSignatureError } from 'ai';
import { describeProviderError } from 'src/llm/domain/describe-provider-error';

export const APPROVAL_EXPIRED_MESSAGE =
  'The approval expired (the server restarted with a different secret). Ask the agent to try again.';
export const GENERIC_STREAM_ERROR = 'The agent could not finish its response.';

/**
 * Text shown to the user when the agent stream fails. `provider` (the
 * conversation model's provider id) names who failed in provider errors.
 */
export function describeStreamError(error: unknown, provider?: string): string {
  if (InvalidToolApprovalSignatureError.isInstance(error)) {
    return APPROVAL_EXPIRED_MESSAGE;
  }
  return (
    (provider && describeProviderError(error, provider)) || GENERIC_STREAM_ERROR
  );
}

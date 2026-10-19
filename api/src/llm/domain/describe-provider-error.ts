import { APICallError, LoadAPIKeyError, RetryError } from 'ai';

type ProviderFailure = {
  /** The provider's last answer (a `RetryError` wraps it). */
  error: unknown;
  attempts: number;
};

const OVERLOADED_STATUSES = new Set([500, 502, 503, 504, 529]);
const AUTH_STATUSES = new Set([401, 403]);
/** Bad request or unknown model: the provider's own message says what. */
const REJECTED_STATUSES = new Set([400, 404]);

function unwrap(error: unknown): ProviderFailure {
  if (RetryError.isInstance(error)) {
    return { error: error.lastError, attempts: error.errors.length };
  }
  return { error, attempts: 1 };
}

function attemptsNote(attempts: number): string {
  return attempts > 1 ? ` It failed ${attempts} times in a row.` : '';
}

/**
 * A user-facing message for failures that come from the model provider
 * (rate limit, overload, bad key), or undefined for anything else.
 * `provider` is the provider id, e.g. "anthropic".
 */
export function describeProviderError(
  error: unknown,
  provider: string,
): string | undefined {
  const { error: cause, attempts } = unwrap(error);
  const note = attemptsNote(attempts);

  if (LoadAPIKeyError.isInstance(cause)) {
    return `No API key configured for ${provider}.`;
  }
  if (!APICallError.isInstance(cause) || cause.statusCode === undefined) {
    return undefined;
  }

  const status = cause.statusCode;
  if (status === 429) {
    return `${provider} rejected the call because of a rate limit (429).${note} Wait a moment and try again, or switch models.`;
  }
  if (OVERLOADED_STATUSES.has(status)) {
    return `${provider} is overloaded or down (${status}).${note} Try again shortly, or switch models.`;
  }
  if (AUTH_STATUSES.has(status)) {
    return `${provider} rejected the API key (${status}). Check the configured key.`;
  }
  if (REJECTED_STATUSES.has(status)) {
    return `${provider} rejected the call (${status}): ${cause.message}`;
  }
  return undefined;
}

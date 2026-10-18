import { APICallError, LoadAPIKeyError, RetryError } from 'ai';

type ProviderFailure = {
  /** The provider's last answer (a `RetryError` wraps it). */
  error: unknown;
  attempts: number;
};

const OVERLOADED_STATUSES = new Set([500, 502, 503, 504, 529]);
const AUTH_STATUSES = new Set([401, 403]);

function unwrap(error: unknown): ProviderFailure {
  if (RetryError.isInstance(error)) {
    return { error: error.lastError, attempts: error.errors.length };
  }
  return { error, attempts: 1 };
}

function attemptsNote(attempts: number): string {
  return attempts > 1 ? ` Falhou ${attempts} vezes seguidas.` : '';
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
    return `Nenhuma chave de API configurada para ${provider}.`;
  }
  if (!APICallError.isInstance(cause) || cause.statusCode === undefined) {
    return undefined;
  }

  const status = cause.statusCode;
  if (status === 429) {
    return `${provider} recusou a chamada por limite de uso (429).${note} Espere um pouco e tente de novo, ou troque de modelo.`;
  }
  if (OVERLOADED_STATUSES.has(status)) {
    return `${provider} está sobrecarregado ou fora do ar (${status}).${note} Tente de novo em instantes, ou troque de modelo.`;
  }
  if (AUTH_STATUSES.has(status)) {
    return `${provider} recusou a chave de API (${status}). Confira a chave configurada.`;
  }
  return undefined;
}

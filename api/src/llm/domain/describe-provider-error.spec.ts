import { APICallError, LoadAPIKeyError, RetryError } from 'ai';
import { describeProviderError } from './describe-provider-error';

const apiError = (statusCode?: number) =>
  new APICallError({
    message: 'failed',
    url: 'https://api.example.com/v1/messages',
    requestBodyValues: {},
    statusCode,
  });

const retried = (lastError: unknown, attempts: number) =>
  new RetryError({
    message: 'failed after retries',
    reason: 'maxRetriesExceeded',
    errors: Array.from({ length: attempts }, () => lastError),
  });

describe('describeProviderError', () => {
  it('explains a rate limit and how many attempts failed', () => {
    const message = describeProviderError(
      retried(apiError(429), 3),
      'anthropic',
    );

    expect(message).toContain('anthropic');
    expect(message).toContain('limite de uso (429)');
    expect(message).toContain('Falhou 3 vezes');
  });

  it.each([500, 503, 529])('explains an overload (%i)', (status) => {
    expect(describeProviderError(apiError(status), 'openai')).toContain(
      `sobrecarregado ou fora do ar (${status})`,
    );
  });

  it('does not mention attempts for a single call', () => {
    expect(describeProviderError(apiError(503), 'openai')).not.toContain(
      'vezes',
    );
  });

  it.each([401, 403])('explains a rejected key (%i)', (status) => {
    expect(describeProviderError(apiError(status), 'deepseek')).toContain(
      `recusou a chave de API (${status})`,
    );
  });

  it('explains a missing key', () => {
    const error = new LoadAPIKeyError({ message: 'missing' });
    expect(describeProviderError(error, 'openai')).toContain(
      'Nenhuma chave de API',
    );
  });

  it('leaves other errors to the caller', () => {
    expect(describeProviderError(apiError(400), 'openai')).toBeUndefined();
    expect(describeProviderError(apiError(), 'openai')).toBeUndefined();
    expect(describeProviderError(new Error('boom'), 'openai')).toBeUndefined();
  });
});

import { DEFAULT_MAX_RETRIES, readMaxRetries } from './read-max-retries';

describe('readMaxRetries', () => {
  it('uses the default when unset or invalid', () => {
    expect(readMaxRetries(undefined)).toBe(DEFAULT_MAX_RETRIES);
    expect(readMaxRetries(' ')).toBe(DEFAULT_MAX_RETRIES);
    expect(readMaxRetries('-1')).toBe(DEFAULT_MAX_RETRIES);
    expect(readMaxRetries('1.5')).toBe(DEFAULT_MAX_RETRIES);
    expect(readMaxRetries('abc')).toBe(DEFAULT_MAX_RETRIES);
  });

  it('accepts 0 to disable retries', () => {
    expect(readMaxRetries('0')).toBe(0);
  });

  it('caps very large values', () => {
    expect(readMaxRetries('5')).toBe(5);
    expect(readMaxRetries('100')).toBe(10);
  });
});

import { timingSafeEqual } from 'crypto';

const BEARER_PREFIX = 'Bearer ';

/** Token from an `Authorization: Bearer <token>` header, or null. */
export function readBearerToken(header: string | undefined): string | null {
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  const token = header.slice(BEARER_PREFIX.length).trim();
  return token || null;
}

/**
 * No expected token → auth is off (browser/Docker setups). Otherwise the
 * header must carry exactly that token; compared in constant time.
 */
export function isAuthorized(
  expectedToken: string | undefined,
  header: string | undefined,
): boolean {
  if (!expectedToken) return true;

  const received = readBearerToken(header);
  if (!received) return false;

  const expected = Buffer.from(expectedToken);
  const actual = Buffer.from(received);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

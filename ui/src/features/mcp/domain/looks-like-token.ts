/** What the API shows instead of a stored literal secret. */
export const SECRET_MASK = "••••";

/**
 * A literal value that is probably a token (long, no spaces, letters and
 * digits), so the form can suggest a `${ENV_VAR}` reference instead.
 */
export function looksLikeToken(value: string): boolean {
  const text = value.trim();
  if (text.length < 20 || text === SECRET_MASK) return false;
  if (/\s/.test(text) || text.includes("${")) return false;
  return /[A-Za-z]/.test(text) && /[0-9]/.test(text);
}

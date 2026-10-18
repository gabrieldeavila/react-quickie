function escapeRegExp(value: string): string {
  return value.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

/** `*` matches any run of characters; everything else is literal. */
export function matchesToolGlob(pattern: string, toolName: string): boolean {
  if (!pattern.includes('*')) return pattern === toolName;
  const source = pattern.split('*').map(escapeRegExp).join('.*');
  return new RegExp(`^${source}$`).test(toolName);
}

export type FileReference = { path: string; line?: number };

// Extensions worth linking; keeps `console.log` or `v1.2` from becoming links.
const FILE_EXTENSIONS =
  "tsx?|jsx?|mjs|cjs|json|md|mdx|css|scss|less|html|vue|svelte|py|go|rs|java|kt|rb|php|cs|c|h|cpp|hpp|sh|ya?ml|toml|sql|prisma|graphql|env|txt|lock";

const FILE_REFERENCE = new RegExp(
  `^((?:[\\w@~.-]+/)*[\\w@~.-]+\\.(?:${FILE_EXTENSIONS}))(?::(\\d+)(?::\\d+)?|#L(\\d+))?$`,
  "i",
);

const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

/**
 * Reads `src/app.ts`, `src/app.ts:42`, `src/app.ts:42:7` or
 * `src/app.ts#L42`. Returns null for URLs, prose and folder-like text.
 */
export function parseFileReference(text: string): FileReference | null {
  const candidate = text.trim().replace(/^\.\//, "");
  if (!candidate || URL_SCHEME.test(candidate)) return null;

  const isAbsolute = candidate.startsWith("/");
  const match = FILE_REFERENCE.exec(
    isAbsolute ? candidate.slice(1) : candidate,
  );
  if (!match) return null;

  const path = isAbsolute ? `/${match[1]}` : match[1];
  const lineText = match[2] ?? match[3];
  const line = lineText ? Number(lineText) : undefined;

  return line ? { path, line } : { path };
}

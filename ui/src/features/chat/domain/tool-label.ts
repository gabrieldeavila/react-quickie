// Moved unchanged from messageItem.tsx.

function shortenToolPath(path?: string, maxSegments = 4): string {
  if (!path) return "";

  const normalized = path.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);

  if (segments.length <= maxSegments) return normalized;

  return `…/${segments.slice(-maxSegments).join("/")}`;
}

/** Card label, with the file path for read/list tools. */
export function getToolLabel(
  part: { type: string; input?: unknown },
  fallbackLabel: string,
): string {
  const input = part.input as Record<string, unknown> | undefined;

  if (part.type === "tool-read_file") {
    const path = typeof input?.path === "string" ? input.path : undefined;
    return path
      ? `Reading file: ${shortenToolPath(path)}`
      : fallbackLabel;
  }

  if (part.type === "tool-list_folders") {
    const parentPath =
      typeof input?.parentPath === "string" ? input.parentPath : undefined;
    return parentPath
      ? `Listing files and folders: ${shortenToolPath(parentPath)}`
      : fallbackLabel;
  }

  return fallbackLabel;
}

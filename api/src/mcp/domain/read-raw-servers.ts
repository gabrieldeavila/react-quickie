import { readConfigDocument } from './mcp-config-text';

/**
 * The servers as written in the file (before `${VAR}` interpolation), for
 * showing and editing. Empty when the file is missing or broken.
 */
export function readRawServers(text: string | null): Record<string, unknown> {
  try {
    return readConfigDocument(text).mcpServers;
  } catch {
    return {};
  }
}

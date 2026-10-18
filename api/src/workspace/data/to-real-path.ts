import * as fs from 'fs';
import * as path from 'path';

/**
 * `fs.realpath` that also works for paths that don't exist yet (new files):
 * it resolves the nearest existing ancestor and re-appends the rest.
 */
export function toRealPath(target: string): string {
  const missingSegments: string[] = [];
  let current = path.resolve(target);

  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) break;
    missingSegments.unshift(path.basename(current));
    current = parent;
  }

  return path.join(fs.realpathSync(current), ...missingSegments);
}

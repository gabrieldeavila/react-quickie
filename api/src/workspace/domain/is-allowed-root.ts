import { isPathInside } from './is-path-inside';

/**
 * A root is allowed when it sits inside one of the allowed roots and neither
 * contains nor sits inside a denied folder (e.g. the Doty data dir).
 */
export function isAllowedRoot(
  root: string,
  allowedRoots: string[],
  deniedPaths: string[] = [],
): boolean {
  const touchesDenied = deniedPaths.some(
    (denied) => isPathInside(denied, root) || isPathInside(root, denied),
  );
  if (touchesDenied) return false;

  return allowedRoots.some((allowed) => isPathInside(allowed, root));
}

import * as path from 'path';

const TEMPLATE_IGNORED_PATHS = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  '.react-router',
  'coverage',
  '.git',
]);

/** Build output and dependencies are never copied from a template. */
export function isTemplateIgnored(relativePath: string): boolean {
  if (!relativePath) return false;
  return relativePath
    .split(path.sep)
    .some((part) => TEMPLATE_IGNORED_PATHS.has(part));
}

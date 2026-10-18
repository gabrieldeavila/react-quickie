import * as os from 'os';
import * as path from 'path';
import { resolveAppPaths, type AppPaths } from './resolve-app-paths';

/**
 * Not memoized on purpose: `.env` is loaded by ConfigModule after this file
 * may already have been imported, so env-based paths are read on each call.
 */
export function getAppPaths(): AppPaths {
  return resolveAppPaths({
    env: process.env,
    baseDir: path.resolve(__dirname, '..'),
    homeDir: os.homedir(),
  });
}

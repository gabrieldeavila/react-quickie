import * as fs from 'fs';
import * as path from 'path';
import { getAppPaths } from 'src/config/app-paths';

/** Source folders `create_agent` writes into (API plugins and UI plugin list). */
export function getAgentBuilderDirs() {
  const { apiSourceDir, uiDir } = getAppPaths();

  return {
    apiPluginDir: path.join(apiSourceDir, 'common', 'agents', 'plugin'),
    uiPluginDir: path.join(uiDir, 'types', 'plugin'),
  };
}

/**
 * `create_agent` edits the Doty source tree, so it only works from a source
 * checkout. In a bundled build (dist only, VSCode) the tool is not offered.
 */
export function hasAgentBuilderSources(): boolean {
  const { apiPluginDir, uiPluginDir } = getAgentBuilderDirs();

  return fs.existsSync(apiPluginDir) && fs.existsSync(uiPluginDir);
}

import type { HostKind } from "./runtime-config.types";

export type HostFeatures = {
  /** "New project" needs the repo's `templates/` folder, not shipped in VSCode. */
  canCreateProjects: boolean;
  /** Agent Builder edits Doty's own source tree, absent from the bundle. */
  canBuildAgents: boolean;
  /** Browser: free-text root. VSCode: the root is a workspace folder. */
  canTypeRoot: boolean;
  /** VSCode: new chat, history and settings are view title-bar buttons, so the in-page header is hidden. */
  hasViewTitleActions: boolean;
};

export const AGENT_BUILDER_MODE = "agent_builder";

export function getHostFeatures(host: HostKind): HostFeatures {
  const isBrowser = host === "browser";
  return {
    canCreateProjects: isBrowser,
    canBuildAgents: isBrowser,
    canTypeRoot: isBrowser,
    hasViewTitleActions: !isBrowser,
  };
}

export function filterModeOptions<T extends { value: string }>(
  options: T[],
  features: HostFeatures,
): T[] {
  if (features.canBuildAgents) return options;
  return options.filter((option) => option.value !== AGENT_BUILDER_MODE);
}

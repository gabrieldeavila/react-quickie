import { parseRuntimeConfig } from "./domain/parse-runtime-config";
import type { RuntimeConfig } from "./domain/runtime-config.types";

declare global {
  interface Window {
    __DOTY_CONFIG__?: unknown;
  }
}

let cached: RuntimeConfig | null = null;

export function getRuntimeConfig(): RuntimeConfig {
  if (!cached) {
    const injected =
      typeof window === "undefined" ? undefined : window.__DOTY_CONFIG__;
    cached = parseRuntimeConfig(injected, import.meta.env.VITE_API_URL ?? "");
  }
  return cached;
}

export function getApiUrl(): string {
  return getRuntimeConfig().apiUrl;
}

export function isVscodeHost(): boolean {
  return getRuntimeConfig().host === "vscode";
}

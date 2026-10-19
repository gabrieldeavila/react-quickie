import { getRuntimeConfig } from "./runtime-config";
import "./styles/file-links.css";

/** Marks the document with its host (`data-host`); colours follow the editor theme via theme-tokens.css. */
export function applyHostTheme(): void {
  document.documentElement.dataset.host = getRuntimeConfig().host;
}

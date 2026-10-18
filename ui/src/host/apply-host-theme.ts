import { getRuntimeConfig } from "./runtime-config";
import "./styles/vscode-theme.css";

/** Marks the document with the host so `vscode-theme.css` can apply. */
export function applyHostTheme(): void {
  document.documentElement.dataset.host = getRuntimeConfig().host;
}

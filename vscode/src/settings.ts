import * as vscode from 'vscode';
import type { DotySettings } from './domain/build-api-env';

export const SETTINGS_SECTION = 'doty';

export function readSettings(): DotySettings {
  const config = vscode.workspace.getConfiguration(SETTINGS_SECTION);
  return {
    defaultModel: config.get<string>('defaultModel'),
    openaiCompatibleBaseUrl: config.get<string>('openaiCompatible.baseUrl'),
    openaiCompatibleModels: config.get<string>('openaiCompatible.models'),
  };
}

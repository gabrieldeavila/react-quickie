import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import type { AgentInput } from '../domain/validate-agent-input';
import { ensureNamedImport, saveFormatted } from '../ast/source-file-edits';

/**
 * Adds the agent to the UI plugin list (`specialty.plugin.ts`): icon import,
 * `AgentFocusPluginEnum` member and a `CHAT_PLUGIN_MODE_OPTIONS` entry.
 */
export function addUiOption(uiPluginDir: string, agent: AgentInput): string {
  const { name, label, icon, iconImport } = agent;
  const filePath = path.resolve(uiPluginDir, 'specialty.plugin.ts');
  const sourceFile = new Project().addSourceFileAtPath(filePath);
  const enumMember = name.toUpperCase();
  const enumRef = `AgentFocusPluginEnum.${enumMember}`;

  ensureNamedImport(sourceFile, icon, iconImport);

  const enumDecl = sourceFile.getEnum('AgentFocusPluginEnum');
  if (enumDecl && !enumDecl.getMember(enumMember)) {
    enumDecl.addMember({ name: enumMember, value: name });
  }

  const options = sourceFile
    .getVariableStatement('CHAT_PLUGIN_MODE_OPTIONS')
    ?.getDeclarations()[0]
    ?.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
  const alreadyListed = options
    ?.getElements()
    .some((element) => element.getText().includes(enumRef));
  if (options && !alreadyListed) {
    options.addElement(`{
          value: ${enumRef},
          label: ${JSON.stringify(label)},
          icon: ${icon},
        }`);
  }

  saveFormatted(sourceFile);
  return filePath;
}

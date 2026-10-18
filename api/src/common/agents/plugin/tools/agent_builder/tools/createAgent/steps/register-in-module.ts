import path from 'path';
import pascalName from 'src/common/utils/pascalCase';
import { Project, SyntaxKind } from 'ts-morph';
import {
  ensureArrayElement,
  ensureNamedImport,
  getArrayProperty,
  runPrettier,
  saveFormatted,
} from '../ast/source-file-edits';

/**
 * Adds the agent's tools service to `AgentsPluginModule` providers and
 * exports. Undefined when the module class is missing.
 */
export function registerInModule(
  agentApiDir: string,
  name: string,
): string | undefined {
  const filePath = path.resolve(agentApiDir, '../', 'agent.plugins.module.ts');
  const sourceFile = new Project().addSourceFileAtPath(filePath);
  const serviceClass = `${pascalName(name)}ToolsService`;

  ensureNamedImport(sourceFile, serviceClass, `./${name}/tools.service`);

  const classDecl = sourceFile.getClass('AgentsPluginModule');
  if (!classDecl) return undefined;

  const moduleOptions = classDecl
    .getDecorator('Module')
    ?.getArguments()[0]
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (moduleOptions) {
    ensureArrayElement(
      getArrayProperty(moduleOptions, 'providers'),
      serviceClass,
    );
    ensureArrayElement(
      getArrayProperty(moduleOptions, 'exports'),
      serviceClass,
    );
  }

  saveFormatted(sourceFile);
  runPrettier(filePath);
  return filePath;
}

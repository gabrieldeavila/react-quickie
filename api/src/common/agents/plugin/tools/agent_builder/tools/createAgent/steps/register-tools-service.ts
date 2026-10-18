import * as fs from 'fs-extra';
import path from 'path';
import pascalName from 'src/common/utils/pascalCase';
import { Project, Scope, SyntaxKind } from 'ts-morph';
import {
  ensureNamedImport,
  runPrettier,
  saveFormatted,
} from '../ast/source-file-edits';
import { blueprintAgentToolService } from '../template';

/** Writes `<agent>/tools.service.ts` from the blueprint. */
export function writeToolsService(agentApiDir: string, name: string) {
  fs.ensureDirSync(agentApiDir);
  fs.writeFileSync(
    path.resolve(agentApiDir, 'tools.service.ts'),
    blueprintAgentToolService(pascalName(name)),
  );
}

/**
 * Wires the new service into `PluginToolsService`: import, constructor
 * parameter and a `toolsFactory` entry. Undefined when the class is missing.
 */
export function registerToolsService(
  agentApiDir: string,
  name: string,
): string | undefined {
  const filePath = path.resolve(agentApiDir, '../', 'tools.plugins.service.ts');
  const sourceFile = new Project().addSourceFileAtPath(filePath);
  const serviceClass = `${pascalName(name)}ToolsService`;
  const factoryKey = name.toLowerCase();
  const serviceParam = `${pascalName(factoryKey)}ToolsService`;

  ensureNamedImport(sourceFile, serviceClass, `./${name}/tools.service`);

  const classDecl = sourceFile.getClass('PluginToolsService');
  if (!classDecl) return undefined;

  const constructor = classDecl.getConstructors()[0];
  if (constructor && !constructor.getParameter(serviceParam)) {
    constructor.addParameter({
      scope: Scope.Private,
      isReadonly: true,
      name: serviceParam,
      type: serviceClass,
    });
  }

  const factory = classDecl
    .getProperty('toolsFactory')
    ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
  if (factory && !factory.getProperty(factoryKey)) {
    factory.addPropertyAssignment({
      name: factoryKey,
      initializer: `() => this.${serviceParam}.createTools()`,
    });
  }

  saveFormatted(sourceFile);
  runPrettier(filePath);
  return filePath;
}

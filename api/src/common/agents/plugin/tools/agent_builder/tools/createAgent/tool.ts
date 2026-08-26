import * as fs from 'fs-extra';
import path from 'path';
import pascalName from 'src/common/utils/pascalCase';
import { Project, SyntaxKind, Scope } from 'ts-morph';
import { blueprintAgentToolService, blueprintSkillAgent } from './template';
import { camelCase } from 'src/common/utils/camelCaseName';
import { execSync } from 'child_process';

export function createAgent({
  name,
  label,
  icon,
  iconImport,
}: {
  name: string;
  label: string;
  icon: string;
  iconImport: string;
}) {
  const apiPath = path.join(process.cwd());
  const uiPath = path.resolve(apiPath, '../ui');

  const apiBaseFolder = 'src/common/agents/plugin';
  const uiBaseFolder = 'types/plugin';

  const apiPluginDir = path.resolve(apiPath, apiBaseFolder);
  const uiPluginDir = path.resolve(uiPath, uiBaseFolder);

  const agentApiDir = path.join(apiPluginDir, 'tools', name.toLowerCase());

  const paths = [
    createUi(uiPluginDir, name, label, icon, iconImport),
    createApi(agentApiDir, name),
    createSkills(apiPluginDir, name),
  ];

  return paths;
}

const createUi = (
  uiPluginDir: string,
  name: string,
  label: string,
  icon: string,
  iconImport: string,
) => {
  const project = new Project();
  const filePath = path.resolve(uiPluginDir, 'specialty.plugin.ts');

  const sourceFile = project.addSourceFileAtPath(filePath);

  const importDecl = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === iconImport,
  );

  if (importDecl) {
    const namedImports = importDecl.getNamedImports().map((i) => i.getName());
    if (!namedImports.includes(icon)) {
      importDecl.addNamedImport(icon);
    }
  } else {
    sourceFile.addImportDeclaration({
      namedImports: [icon],
      moduleSpecifier: iconImport,
    });
  }

  const enumDecl = sourceFile.getEnum('AgentFocusPluginEnum');
  const nameUppercase = name.toUpperCase();

  if (enumDecl) {
    const memberExists = enumDecl.getMember(nameUppercase);
    if (!memberExists) {
      enumDecl.addMember({
        name: nameUppercase,
        value: name,
      });
    }
  }

  const variableStatement = sourceFile.getVariableStatement(
    'CHAT_PLUGIN_MODE_OPTIONS',
  );

  if (variableStatement) {
    const declaration = variableStatement.getDeclarations()[0];
    const initializer = declaration.getInitializerIfKind(
      SyntaxKind.ArrayLiteralExpression,
    );

    if (initializer) {
      const newObjectString = `{
          value: AgentFocusPluginEnum.${nameUppercase},
          label: "${label}",
          icon: ${icon},
        }`;

      initializer.addElement(newObjectString);
    }
  }

  sourceFile.organizeImports();

  sourceFile.formatText({
    indentSize: 2,
    convertTabsToSpaces: true,
  });

  sourceFile.saveSync();

  return filePath;
};

const createApi = (agentApiDir: string, name: string) => {
  const namePascalized = pascalName(name);
  const agentToolServiceContent = blueprintAgentToolService(namePascalized);

  fs.ensureDirSync(agentApiDir);

  fs.writeFileSync(
    path.resolve(agentApiDir, 'tools.service.ts'),
    agentToolServiceContent,
  );

  const project = new Project();
  const filePath = path.resolve(agentApiDir, '../', 'tools.plugins.service.ts');
  const sourceFile = project.addSourceFileAtPath(filePath);

  const newServiceImportPath = `./${name}/tools.service`;
  const newServiceImportName = `${namePascalized}ToolsService`;

  const importDecl = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === newServiceImportPath,
  );

  if (!importDecl) {
    sourceFile.addImportDeclaration({
      namedImports: [newServiceImportName],
      moduleSpecifier: newServiceImportPath,
    });
  }

  const classDecl = sourceFile.getClass('PluginToolsService');

  const nameLowercased = name.toLowerCase();
  const nameCamel = camelCase(nameLowercased);
  const newServiceVarName = `${nameCamel}ToolsService`;

  if (classDecl) {
    const constructor = classDecl.getConstructors()[0];

    if (constructor) {
      const paramExists = constructor.getParameter(newServiceVarName);

      if (!paramExists) {
        constructor.addParameter({
          scope: Scope.Private,
          isReadonly: true,
          name: newServiceVarName,
          type: newServiceImportName,
        });
      }
    }

    const toolsFactoryProp = classDecl.getProperty('toolsFactory');

    if (toolsFactoryProp) {
      const initializer = toolsFactoryProp.getInitializerIfKind(
        SyntaxKind.ObjectLiteralExpression,
      );

      if (initializer) {
        const propertyExists = initializer.getProperty(nameLowercased);

        if (!propertyExists) {
          initializer.addPropertyAssignment({
            name: nameLowercased,
            initializer: `() => this.${newServiceVarName}.createTools()`,
          });
        }
      }
    }

    sourceFile.organizeImports();
    sourceFile.formatText({
      indentSize: 2,
      convertTabsToSpaces: true,
    });
    sourceFile.saveSync();

    try {
      execSync(`npx prettier --write "${filePath}"`, { stdio: 'ignore' });
      console.log(`Tools Factory atualizado e formatado em: ${filePath}`);
    } catch (error: any) {
      console.warn(
        'Aviso: Não foi possível rodar o Prettier automaticamente.',
        error?.message,
      );
    }

    return filePath;
  }
};

const createSkills = (apiPluginDir: string, name: string) => {
  const agentApiDir = path.join(apiPluginDir, 'skills', name.toLowerCase());
  const skillFilePath = path.join(agentApiDir, 'index.md');

  fs.ensureDirSync(agentApiDir);

  if (!fs.existsSync(skillFilePath)) {
    const skillContent = blueprintSkillAgent(name);
    fs.writeFileSync(skillFilePath, skillContent);
  }

  return skillFilePath;
};

import { promises as fs } from 'fs';
import * as path from 'path';
import {
  buildFullstackPackageJson,
  FULLSTACK_PARTS,
  FULLSTACK_ROOT_GITIGNORE,
} from './domain/fullstack-root-files';
import { isTemplateIgnored } from './domain/is-template-ignored';

export const pathExists = (target: string) =>
  fs.stat(target).then(
    () => true,
    () => false,
  );

export async function copyTemplate(source: string, destination: string) {
  await fs.cp(source, destination, {
    recursive: true,
    filter: (entry) => !isTemplateIgnored(path.relative(source, entry)),
  });
}

/** api/ from `nest-base`, ui/ from `vite-base`, plus root package.json and .gitignore. */
export async function copyFullstackTemplate(
  templatesRoot: string,
  projectPath: string,
  name: string,
) {
  const apiTemplate = path.join(templatesRoot, FULLSTACK_PARTS.api);
  const uiTemplate = path.join(templatesRoot, FULLSTACK_PARTS.ui);
  if (!(await pathExists(apiTemplate)) || !(await pathExists(uiTemplate))) {
    throw new Error('Os templates nest-base e vite-base são necessários.');
  }

  await fs.mkdir(projectPath, { recursive: true });
  await copyTemplate(apiTemplate, path.join(projectPath, 'api'));
  await copyTemplate(uiTemplate, path.join(projectPath, 'ui'));
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    buildFullstackPackageJson(name),
    'utf8',
  );
  await fs.writeFile(
    path.join(projectPath, '.gitignore'),
    FULLSTACK_ROOT_GITIGNORE,
    'utf8',
  );
}

/** Sets `name` in the copied package.json; a template without one is fine. */
export async function renamePackage(
  projectPath: string,
  name: string,
  template: string,
) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as {
      name?: string;
    };
    pkg.name = name;
    await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
  } catch {
    console.log(`Aviso: package.json não encontrado no template ${template}`);
  }
}

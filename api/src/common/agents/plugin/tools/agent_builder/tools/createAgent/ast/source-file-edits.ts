import { execFileSync } from 'child_process';
import {
  SyntaxKind,
  type ArrayLiteralExpression,
  type ObjectLiteralExpression,
  type SourceFile,
} from 'ts-morph';

/** Adds `import { name } from moduleSpecifier`, merging into an existing import. */
export function ensureNamedImport(
  sourceFile: SourceFile,
  name: string,
  moduleSpecifier: string,
) {
  const existing = sourceFile.getImportDeclaration(
    (decl) => decl.getModuleSpecifierValue() === moduleSpecifier,
  );
  if (!existing) {
    sourceFile.addImportDeclaration({ namedImports: [name], moduleSpecifier });
    return;
  }
  const names = existing.getNamedImports().map((item) => item.getName());
  if (!names.includes(name)) existing.addNamedImport(name);
}

/** Appends `element` (source text) unless an element with that text exists. */
export function ensureArrayElement(
  array: ArrayLiteralExpression | undefined,
  element: string,
) {
  if (!array) return;
  const exists = array.getElements().some((item) => item.getText() === element);
  if (!exists) array.addElement(element);
}

/** The array literal assigned to `property` in an object literal. */
export function getArrayProperty(
  object: ObjectLiteralExpression,
  property: string,
): ArrayLiteralExpression | undefined {
  return object
    .getProperty(property)
    ?.asKind(SyntaxKind.PropertyAssignment)
    ?.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
}

/** Organizes imports, formats with 2 spaces and saves. */
export function saveFormatted(sourceFile: SourceFile) {
  sourceFile.organizeImports();
  sourceFile.formatText({ indentSize: 2, convertTabsToSpaces: true });
  sourceFile.saveSync();
}

/** Best effort: the file is already valid, Prettier only matches the repo style. */
export function runPrettier(filePath: string) {
  try {
    execFileSync('npx', ['prettier', '--write', filePath], { stdio: 'ignore' });
  } catch (error) {
    console.warn(
      'Warning: could not run Prettier automatically.',
      (error as Error)?.message,
    );
  }
}

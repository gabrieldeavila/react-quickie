/**
 * A package to install, e.g. `lodash`, `@types/node@^24` or `react@19.2.0`.
 * It reaches `pnpm` as a single argument without a shell; this also keeps it
 * from being read as an option (`--global`, `-w`).
 */
export function assertPackageSpec(dependency: string): string {
  const spec = dependency.trim();
  if (!spec || spec.startsWith('-') || /\s/.test(spec)) {
    throw new Error(
      `Nome de dependência inválido: "${dependency}". Informe um único pacote, como "lodash" ou "@types/node@^24".`,
    );
  }
  return spec;
}

export function pnpmAddArgs(spec: string, isDev: boolean): string[] {
  return isDev ? ['i', spec, '-D'] : ['i', spec];
}

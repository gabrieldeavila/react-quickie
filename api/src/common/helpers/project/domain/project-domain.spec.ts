import { buildFullstackPackageJson } from './fullstack-root-files';
import { isTemplateIgnored } from './is-template-ignored';
import { assertPackageSpec, pnpmAddArgs } from './package-spec';

describe('isTemplateIgnored', () => {
  it('keeps the template root and normal files', () => {
    expect(isTemplateIgnored('')).toBe(false);
    expect(isTemplateIgnored('src/app.ts')).toBe(false);
  });

  it('skips dependencies and build output at any depth', () => {
    expect(isTemplateIgnored('node_modules')).toBe(true);
    expect(isTemplateIgnored('packages/a/dist/index.js')).toBe(true);
    expect(isTemplateIgnored('.git/HEAD')).toBe(true);
  });
});

describe('buildFullstackPackageJson', () => {
  it('names the project and runs both apps', () => {
    const pkg = JSON.parse(buildFullstackPackageJson('shop')) as {
      name: string;
      scripts: Record<string, string>;
    };

    expect(pkg.name).toBe('shop');
    expect(pkg.scripts.dev).toContain('pnpm --dir api run start:dev');
    expect(pkg.scripts.dev).toContain('pnpm --dir ui run dev');
  });
});

describe('assertPackageSpec', () => {
  it.each(['lodash', '@types/node@^24', 'react@19.2.0'])(
    'accepts %p',
    (spec) => {
      expect(assertPackageSpec(` ${spec} `)).toBe(spec);
    },
  );

  it.each(['', '-g', '--global', 'lodash; rm -rf ~', 'a b'])(
    'rejects %p',
    (spec) => {
      expect(() => assertPackageSpec(spec)).toThrow('Invalid dependency name');
    },
  );

  it('adds -D for dev dependencies', () => {
    expect(pnpmAddArgs('vitest', true)).toEqual(['i', 'vitest', '-D']);
    expect(pnpmAddArgs('react', false)).toEqual(['i', 'react']);
  });
});

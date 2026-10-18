/** Template name that combines `nest-base` (api/) and `vite-base` (ui/). */
export const FULLSTACK_TEMPLATE = 'nest-vite-base';
export const FULLSTACK_PARTS = { api: 'nest-base', ui: 'vite-base' } as const;

export const FULLSTACK_ROOT_GITIGNORE = `# Dependencies
node_modules/

# Build output
api/dist/
ui/dist/
ui/build/
ui/.react-router/

# Environment variables
.env
.env.*
!.env.example

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Coverage
coverage/

# OS and editor files
.DS_Store
.idea/
.vscode/
`;

/** Root `package.json` that runs api/ and ui/ together. */
export function buildFullstackPackageJson(name: string): string {
  return JSON.stringify(
    {
      name,
      private: true,
      scripts: {
        dev: 'concurrently -k -n api,ui "pnpm --dir api run start:dev" "pnpm --dir ui run dev"',
        build: 'pnpm --dir api run build && pnpm --dir ui run build',
        start:
          'concurrently -k -n api,ui "pnpm --dir api run start:prod" "pnpm --dir ui run start"',
      },
      devDependencies: { concurrently: '^10.0.5' },
    },
    null,
    2,
  );
}

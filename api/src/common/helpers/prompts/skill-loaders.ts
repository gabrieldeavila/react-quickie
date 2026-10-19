import type { SystemModelMessage } from 'ai';
import * as fs from 'fs-extra';
import path from 'path';

/** Markdown file → rendered text, '' when missing or unreadable. */
export type ReadMarkdown = (file: string) => Promise<string>;

async function toInstruction(
  readMarkdown: ReadMarkdown,
  file: string,
): Promise<SystemModelMessage[]> {
  const content = await readMarkdown(file);
  return content?.length ? [{ role: 'system', content }] : [];
}

async function loadEach(
  readMarkdown: ReadMarkdown,
  files: string[],
): Promise<SystemModelMessage[]> {
  const instructions: SystemModelMessage[] = [];
  for (const file of files) {
    instructions.push(...(await toInstruction(readMarkdown, file)));
  }
  return instructions;
}

async function listFiles(dir: string): Promise<string[]> {
  if (!(await fs.pathExists(dir))) return [];
  return (await fs.readdir(dir)).map((file) => path.join(dir, file));
}

/** One file (`behavior.md`, `memory.md`); empty when missing. */
export async function loadSkillFile(
  readMarkdown: ReadMarkdown,
  file: string,
): Promise<SystemModelMessage[]> {
  if (!(await fs.pathExists(file))) return [];
  return toInstruction(readMarkdown, file);
}

/**
 * A skills folder: `index.md`, every file in `default/`, then
 * `specialty/<specialty>.md` when a specialty is chosen.
 */
export async function loadSkillDirectory(
  readMarkdown: ReadMarkdown,
  dir: string,
  specialty: string | undefined,
): Promise<SystemModelMessage[]> {
  if (!(await fs.pathExists(dir))) return [];

  const index = path.join(dir, 'index.md');
  const instructions = await loadEach(readMarkdown, [
    ...((await fs.pathExists(index)) ? [index] : []),
    ...(await listFiles(path.join(dir, 'default'))),
  ]);

  if (!specialty || specialty === 'none') return instructions;
  const specialtyFile = path.join(dir, 'specialty', `${specialty}.md`);
  return [
    ...instructions,
    ...(await loadSkillFile(readMarkdown, specialtyFile)),
  ];
}

/** `AGENTS.md` at the project root (the cross-tool convention). */
export async function loadAgentsFile(
  readMarkdown: ReadMarkdown,
  root: string | undefined,
): Promise<SystemModelMessage[]> {
  if (!root) return [];
  return loadSkillFile(readMarkdown, path.join(root, 'AGENTS.md'));
}

/** The project's own `.agents/*.md` instructions (legacy). */
export async function loadProjectAgents(
  readMarkdown: ReadMarkdown,
  root: string | undefined,
): Promise<SystemModelMessage[]> {
  if (!root) return [];
  return loadEach(readMarkdown, await listFiles(path.join(root, '.agents')));
}

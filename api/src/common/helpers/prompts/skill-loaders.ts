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

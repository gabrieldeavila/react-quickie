import * as fs from 'fs-extra';
import matter from 'gray-matter';

/**
 * The Markdown of a prompt file without its frontmatter, trimmed; '' when the
 * file is missing or unreadable. The model gets plain Markdown, not HTML.
 */
export async function readMarkdownBody(file: string): Promise<string> {
  try {
    const text = await fs.readFile(file, 'utf-8');
    return matter(text).content.trim();
  } catch {
    return '';
  }
}

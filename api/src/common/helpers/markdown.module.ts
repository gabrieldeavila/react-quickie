import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

@Injectable()
export class MarkdownService {
  getMarkdownFile(filename: string) {
    try {
      filename = filename.endsWith('.md') ? filename : `${filename}.md`;
      const filePath = path.join(filename);

      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const { data, content } = matter(fileContent);

      const htmlContent = marked.parse(content);

      return {
        metadata: data,
        html: htmlContent,
      };
    } catch (error) {
      console.error('Error reading markdown file:', error);
      return { metadata: {}, html: '' };
    }
  }
}

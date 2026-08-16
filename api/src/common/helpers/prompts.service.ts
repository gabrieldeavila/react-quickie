import { Injectable } from '@nestjs/common';
import { Instructions } from 'ai';
import { MarkdownService } from './markdown.module';
import { ContextService } from '../context/context.service';
import * as fs from 'fs-extra';
import path from 'path';

@Injectable()
export class PromptsService {
  constructor(
    private readonly markdownService: MarkdownService,
    private readonly contextService: ContextService,
  ) {}
  private readonly contentPath = path.join(process.cwd(), 'src');

  async getInstructions(): Promise<Instructions> {
    const modeSkills = await this.getModeSkills();
    const isPlanning = this.contextService.get('planningModeEnabled');

    const instructions: Instructions = [
      {
        role: 'system',
        content: `The user project is ${this.contextService.get('root')}`,
      },
    ];

    if (Array.isArray(modeSkills)) {
      instructions.push(...modeSkills);
    }

    if (isPlanning) {
      const planningSkills = await this.getPlanningSkills();
      if (Array.isArray(planningSkills)) instructions.push(...planningSkills);
    }

    return instructions;
  }

  async getModeSkills(): Promise<Instructions | null> {
    const mode = this.contextService.get('mode');

    const pathSkills = `common/skills/${mode}`;
    const pathSearch = path.join(this.contentPath, pathSkills);
    const exists = await fs.pathExists(pathSearch);

    const instructions: Instructions = [];

    const projectAgents = await this.getProjectAgents();

    if (Array.isArray(projectAgents)) {
      instructions.push(...projectAgents);
    }

    if (!exists) {
      return instructions;
    }

    const content = await this.markdownService.getMarkdownFile(
      `${pathSearch}/index.md`,
    )?.html;

    if (content.length) {
      instructions.push({
        content,
        role: 'system',
      });
    }
    const defaultPath = `${pathSearch}/default`;

    const existsDefaultInstructions = await fs.pathExists(defaultPath);

    if (existsDefaultInstructions) {
      const files = await fs.readdir(defaultPath);

      for (const file of files) {
        const contentDefault = await this.markdownService.getMarkdownFile(
          `${defaultPath}/${file}`,
        )?.html;

        instructions.push({
          content: contentDefault,
          role: 'system',
        });
      }
    }

    const specialty = this.contextService.get('specialty');

    if (!specialty || specialty === 'none') {
      return instructions;
    }

    const specialtyFilePath = `${pathSearch}/specialty/${specialty}.md`;
    const existsSpecialtyInstructions = await fs.pathExists(specialtyFilePath);

    if (existsSpecialtyInstructions) {
      const contentSpecialty =
        await this.markdownService.getMarkdownFile(specialtyFilePath)?.html;

      instructions.push({
        content: contentSpecialty,
        role: 'system',
      });
    }

    return instructions;
  }

  async getPlanningSkills(): Promise<Instructions | null> {
    const pathPlanning = 'common/skills/planning.md';
    const pathSearch = path.join(this.contentPath, pathPlanning);

    const exists = await fs.pathExists(pathSearch);

    if (!exists) return null;

    const content =
      await this.markdownService.getMarkdownFile(pathSearch)?.html;

    const instructions: Instructions = [];

    if (content.length) {
      instructions.push({
        content,
        role: 'system',
      });
    }

    return instructions;
  }

  async getProjectAgents(): Promise<Instructions | null> {
    const pathRoot = this.contextService.get('root')!;

    const pathAgents = path.join(pathRoot, '.agents');

    if (!fs.existsSync(pathAgents)) {
      return null;
    }

    const files = await fs.readdir(pathAgents);

    const instructions: Instructions = [];

    for (const file of files) {
      const content = await this.markdownService.getMarkdownFile(
        `${pathAgents}/${file}`,
      )?.html;

      if (content.length) {
        instructions.push({
          content,
          role: 'system',
        });
      }
    }

    return instructions;
  }
}

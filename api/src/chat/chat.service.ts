import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ProjectService } from 'src/common/helpers/project.service';
import z from 'zod';

@Injectable()
export class ChatService {
  constructor(private readonly projectService: ProjectService) {}

  getTools() {
    return {
      create_project: tool({
        description: 'Cria um novo projeto de react com tailwind next',
        inputSchema: z.object({
          name: z.string().describe('Nome do projeto'),
        }),
        execute: async ({ name }) => {
          // Agora o TypeScript sabe exatamente o que a IA está passando
          const project = this.projectService.createProject({
            projectName: name,
          });

          return { success: true, message: project };
        },
      }),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { tool } from 'ai';
import { ContextService } from 'src/common/context/context.service';
import { WorkspaceService } from 'src/workspace/data/workspace.service';
import { z } from 'zod/v4';
import { formatToolError, toolSuccess } from '../shared/format-tool-error';
import { createComponent } from './templates/componentBlueprint';

type ComponentBlueprint = string | Record<string, unknown>;

function normalizeBlueprint(result: ComponentBlueprint): string[] {
  const content =
    typeof result === 'string' ? result : JSON.stringify(result, null, 2);

  return [content];
}

@Injectable()
export class FrontendToolsService {
  constructor(
    private readonly contextService: ContextService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  createFrontendTools() {
    return {
      create_component_blueprint: tool({
        description:
          'Generates the full boilerplate for a complex React component, creating several files such as index, contexts (Base and Services) and types. Use this tool whenever you need to create a new feature or complex component.',
        inputSchema: z.object({
          name: z
            .string()
            .regex(/^[A-Za-z][A-Za-z0-9]*$/, 'Use letters and digits only.')
            .describe(
              'Component or feature name in PascalCase (e.g. UserProfile, DashboardMatrix). It names the functions, types and main folder.',
            ),
          targetPath: z
            .string()
            .describe(
              "Relative path of the folder where the component is created (e.g. 'src/components', 'src/features'). The project root is implied.",
            ),
        }),
        execute: ({
          name,
          targetPath,
        }: {
          name: string;
          targetPath: string;
        }) => {
          try {
            const rootPath = this.contextService.get('root');
            if (!rootPath) {
              return formatToolError(
                'generate the component blueprint',
                new Error('Project root not found.'),
              );
            }

            const pathToAdd = this.workspaceService.resolve(targetPath);
            const result = createComponent(name, pathToAdd, rootPath);

            return toolSuccess(
              'Component blueprint generated.',
              normalizeBlueprint(result),
            );
          } catch (error) {
            return formatToolError('generate the component blueprint', error);
          }
        },
      }),
    };
  }
}

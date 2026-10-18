import path from 'path';
import { getAgentBuilderDirs } from '../../agent-builder-dirs';
import {
  validateAgentInput,
  type AgentInput,
} from './domain/validate-agent-input';
import { addUiOption } from './steps/add-ui-option';
import { createSkill } from './steps/create-skill';
import { registerInModule } from './steps/register-in-module';
import {
  registerToolsService,
  writeToolsService,
} from './steps/register-tools-service';

/** Generates a plugin agent (UI option, API tools service, skill); returns the touched files. */
export function createAgent(input: AgentInput) {
  const agent = validateAgentInput(input);
  const { apiPluginDir, uiPluginDir } = getAgentBuilderDirs();
  const agentApiDir = path.join(apiPluginDir, 'tools', agent.name);

  const uiFile = addUiOption(uiPluginDir, agent);
  writeToolsService(agentApiDir, agent.name);
  return [
    uiFile,
    registerToolsService(agentApiDir, agent.name),
    registerInModule(agentApiDir, agent.name),
    createSkill(apiPluginDir, agent.name),
  ];
}

import * as fs from 'fs-extra';
import path from 'path';
import { blueprintSkillAgent } from '../template';

/** `skills/<agent>/index.md` from the blueprint; an existing skill is kept. */
export function createSkill(apiPluginDir: string, name: string): string {
  const skillDir = path.join(apiPluginDir, 'skills', name.toLowerCase());
  const skillFilePath = path.join(skillDir, 'index.md');

  fs.ensureDirSync(skillDir);
  if (!fs.existsSync(skillFilePath)) {
    fs.writeFileSync(skillFilePath, blueprintSkillAgent(name));
  }
  return skillFilePath;
}

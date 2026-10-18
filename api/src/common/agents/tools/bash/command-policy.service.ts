import { Injectable } from '@nestjs/common';
import { assessCommand, type CommandAssessment } from './domain/command-policy';

export type {
  CommandAssessment,
  CommandDecision,
} from './domain/command-policy';

@Injectable()
export class CommandPolicyService {
  assess(command: string, rootPath: string): CommandAssessment {
    return assessCommand(command, rootPath);
  }
}

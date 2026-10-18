import { Injectable } from '@nestjs/common';
import { ContextService } from 'src/common/context/context.service';
import { createGitChangesTools } from './tools/git-changes.tools';
import { createGitHistoryTools } from './tools/git-history.tools';

@Injectable()
export class GitToolsService {
  constructor(private readonly contextService: ContextService) {}

  createGitTools() {
    const getRoot = () => this.contextService.get('root');
    return {
      ...createGitHistoryTools(getRoot),
      ...createGitChangesTools(getRoot),
    };
  }
}

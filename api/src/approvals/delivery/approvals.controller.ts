import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { ApprovalRulesRepository } from '../data/approval-rules.repository';
import { ApprovalRulesInvalidError } from '../domain/approval-rules-invalid.error';
import type { ApprovalRuleTarget } from '../domain/edit-approval-rules';
import { validateRuleRequest } from '../domain/validate-rule-request';

/**
 * The user's "Always allow" rules. UI-only: no agent tool reaches these
 * endpoints or the file behind them.
 */
@UseInterceptors(
  BuildContextInterceptor((req) => {
    const fromQuery = (req.query as Record<string, unknown>)?.root;
    const fromBody = (req.body as Record<string, unknown> | undefined)?.root;
    const root = typeof fromQuery === 'string' ? fromQuery : fromBody;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('approvals')
export class ApprovalsController {
  constructor(
    private readonly repository: ApprovalRulesRepository,
    private readonly contextService: ContextService,
  ) {}

  /** `GET /approvals/rules?root=`: global rules and this project's. */
  @Get('rules')
  async list() {
    const root = this.contextService.get('root');
    const { rules, error } = await this.repository.read();
    return {
      global: rules.global,
      project: root
        ? (rules.projects[this.repository.projectKey(root)] ?? [])
        : [],
      ...(error ? { error } : {}),
    };
  }

  /** `POST /approvals/rules` `{ root, scope, tool, command? }`. */
  @Post('rules')
  @HttpCode(200)
  async add(@Body() body: Record<string, unknown>) {
    const target = this.readTarget(body);
    await this.runEdit(() => this.repository.add(target));
    return this.list();
  }

  /** `DELETE /approvals/rules` with the same body as `POST`. */
  @Delete('rules')
  async remove(@Body() body: Record<string, unknown>) {
    const target = this.readTarget(body);
    await this.runEdit(() => this.repository.remove(target));
    return this.list();
  }

  /** A broken rules file answers 409: the user has to fix it first. */
  private async runEdit(edit: () => Promise<void>): Promise<void> {
    try {
      await edit();
    } catch (error) {
      if (error instanceof ApprovalRulesInvalidError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  private readTarget(body: Record<string, unknown> = {}): ApprovalRuleTarget {
    const result = validateRuleRequest(body, this.contextService.get('root'));
    if (!result.ok) throw new BadRequestException(result.message);
    return result.target;
  }
}

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { BuildContextInterceptor } from 'src/common/context/context.interceptor';
import { ContextService } from 'src/common/context/context.service';
import { InstructionsRepository } from '../data/instructions.repository';
import {
  INSTRUCTION_SCOPES,
  type InstructionScope,
} from '../domain/instruction.types';
import {
  toInstructionDetailView,
  toInstructionView,
} from '../domain/to-instruction-view';
import { isValidInstructionId } from '../domain/validate-instruction-id';
import {
  InvalidInstructionInputError,
  validateInstructionInput,
} from '../domain/validate-instruction-input';

@UseInterceptors(
  BuildContextInterceptor((req) => {
    const fromQuery = (req.query as Record<string, unknown>)?.root;
    const fromBody = (req.body as Record<string, unknown> | undefined)?.root;
    const root = typeof fromQuery === 'string' ? fromQuery : fromBody;
    return { root: typeof root === 'string' ? root : undefined };
  }),
)
@Controller('instructions')
export class InstructionsController {
  constructor(
    private readonly repository: InstructionsRepository,
    private readonly contextService: ContextService,
  ) {}

  /** `GET /instructions?root=`: every instruction, without bodies. */
  @Get()
  async list() {
    const instructions = await this.repository.list(this.root());
    return { instructions: instructions.map(toInstructionView) };
  }

  /** `GET /instructions/:id?root=`: one instruction with its body. */
  @Get(':id')
  async get(@Param('id') id: string) {
    const instruction = await this.repository.get(
      this.validId(id),
      this.root(),
    );
    if (!instruction) {
      throw new NotFoundException(`Instruction "${id}" not found.`);
    }
    return toInstructionDetailView(instruction);
  }

  /**
   * `PUT /instructions/:scope/:id`: creates or replaces a global or project
   * instruction. Saving a built-in's id here makes an editable copy of it.
   */
  @Put(':scope/:id')
  async write(
    @Param('scope') scope: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const target = this.validScope(scope);
    const validId = this.validId(id);
    let input;
    try {
      input = validateInstructionInput(body);
    } catch (error) {
      if (error instanceof InvalidInstructionInputError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const written = await this.repository.write(
      target,
      validId,
      input,
      this.rootFor(target),
    );
    return toInstructionDetailView(written);
  }

  /** `DELETE /instructions/:scope/:id?root=`. */
  @Delete(':scope/:id')
  @HttpCode(204)
  async remove(@Param('scope') scope: string, @Param('id') id: string) {
    const target = this.validScope(scope);
    const removed = await this.repository.remove(
      target,
      this.validId(id),
      this.rootFor(target),
    );
    if (!removed) {
      throw new NotFoundException(`No ${target} instruction "${id}".`);
    }
  }

  private root(): string | undefined {
    return this.contextService.get('root');
  }

  /** Project writes need the project root; global ones don't. */
  private rootFor(scope: InstructionScope): string | undefined {
    const root = this.root();
    if (scope === 'project' && !root) {
      throw new BadRequestException('Send the project root (root).');
    }
    return root;
  }

  private validScope(scope: string): InstructionScope {
    if (!INSTRUCTION_SCOPES.includes(scope as InstructionScope)) {
      throw new BadRequestException(
        'Scope must be "global" or "project"; built-in instructions are read-only.',
      );
    }
    return scope as InstructionScope;
  }

  private validId(id: string): string {
    if (!isValidInstructionId(id)) {
      throw new BadRequestException(
        'Instruction ids use lowercase letters, digits and "-" (up to 64).',
      );
    }
    return id;
  }
}

import { Injectable } from '@nestjs/common';
import { LinterService } from './linter.service';
import { FileReadService } from './storage/file-read.service';
import { FileSearchService } from './storage/file-search.service';
import { FileWriteService } from './storage/file-write.service';

/** The workspace file services the storage tools need, injected as one. */
@Injectable()
export class StorageService {
  constructor(
    readonly read: FileReadService,
    readonly write: FileWriteService,
    readonly search: FileSearchService,
    readonly linter: LinterService,
  ) {}
}

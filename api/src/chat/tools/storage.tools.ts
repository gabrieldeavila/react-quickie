import type { StorageService } from 'src/common/helpers/storage.service';
import { createFileMoveTools } from './storage/file-move.tools';
import { createFileReadTools } from './storage/file-read.tools';
import { createFileSearchTools } from './storage/file-search.tools';
import { createFileWriteTools } from './storage/file-write.tools';

/** Every workspace file tool, read and write; modes pick from these by name. */
export function createStorageTools(storage: StorageService) {
  return {
    ...createFileReadTools(storage.read),
    ...createFileWriteTools(storage.write),
    ...createFileMoveTools(storage.write),
    ...createFileSearchTools(storage.search, storage.linter),
  };
}

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { BaseRequestContext } from './base-context.interface';

export const appStorage = new AsyncLocalStorage<BaseRequestContext>();

@Injectable()
export class ContextService {
  run<R>(store: BaseRequestContext, callback: () => R): R {
    return appStorage.run(store, callback);
  }

  get(): BaseRequestContext | undefined;
  get<K extends keyof BaseRequestContext>(
    key: K,
  ): BaseRequestContext[K] | undefined;
  get<K extends keyof BaseRequestContext>(key?: K): any {
    const store = appStorage.getStore();
    if (!store) return undefined;
    return key ? store[key] : store;
  }
}

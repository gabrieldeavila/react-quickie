import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ContextService } from './context.service';
import { ContextFallbackMiddleware } from './context-fallback.middleware';

@Global()
@Module({
  providers: [ContextService],
  exports: [ContextService],
})
export class ContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextFallbackMiddleware).forRoutes('*');
  }
}

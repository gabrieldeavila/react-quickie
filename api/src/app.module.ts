import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { ContextModule } from './common/context/context.module';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './common/helpers/project.service';
import { LoggerService } from './common/helpers/logger.service';
import { TsCheckerService } from './common/helpers/tschecker.service';

@Module({
  imports: [
    ChatModule,
    ContextModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [AppController, ProjectController],
  providers: [AppService, ProjectService, LoggerService, TsCheckerService],
})
export class AppModule {}

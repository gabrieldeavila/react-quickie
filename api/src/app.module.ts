import * as path from 'path';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { InstructionsModule } from './instructions/instructions.module';
import { ContextModule } from './common/context/context.module';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './common/helpers/project.service';
import { TsCheckerService } from './common/helpers/tschecker.service';
import { WorkspaceModule } from './workspace/workspace.module';
import { getAppPaths } from './config/app-paths';
import { AuthGuard } from './auth/delivery/auth.guard';

@Module({
  imports: [
    ChatModule,
    InstructionsModule,
    ContextModule,
    WorkspaceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.local',
        '.env',
        path.join(getAppPaths().apiDir, '.env.local'),
        path.join(getAppPaths().apiDir, '.env'),
      ],
    }),
  ],
  controllers: [AppController, ProjectController],
  providers: [
    AppService,
    ProjectService,
    TsCheckerService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}

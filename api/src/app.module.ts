import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesController } from './files/files.controller';
import { IaModule } from './ia/ia.module';
import { StorageModule } from './storage/storage.module';
import { ChatController } from './chat/chat.controller';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    IaModule,
    StorageModule,
    ChatModule,
    ConfigModule.forRoot({
      isGlobal: true, // Torna o serviço disponível em toda a aplicação
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {}

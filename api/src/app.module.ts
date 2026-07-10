import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesController } from './files/files.controller';
import { IaModule } from './ia/ia.module';

@Module({
  imports: [IaModule],
  controllers: [AppController, FilesController],
  providers: [AppService],
})
export class AppModule {}

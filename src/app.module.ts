import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrontendCommunicationModule } from './frontend-communication/frontend-communication.module';

@Module({
  imports: [FrontendCommunicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

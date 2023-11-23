import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrontendCommunicationModule } from './frontend-communication/frontend-communication.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/clientbetdb'),
    FrontendCommunicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

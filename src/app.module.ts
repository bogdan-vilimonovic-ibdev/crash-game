import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BetModule } from './bet/bet.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/clientbetdb'),
    BetModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

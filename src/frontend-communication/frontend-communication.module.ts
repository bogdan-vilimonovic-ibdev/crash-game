import { Module } from '@nestjs/common';
import { FrontendCommunicationGateway } from './frontend-communication.gateway';
import { FrontendCommunicationService } from './frontend-communication.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('REDIS_URL'),
        }),
      }),
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
  providers: [FrontendCommunicationGateway, FrontendCommunicationService],
  exports: [FrontendCommunicationGateway],
})
export class FrontendCommunicationModule {}

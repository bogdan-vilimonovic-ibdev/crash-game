import { Module } from '@nestjs/common';
import { FrontendCommunicationGateway } from './frontend-communication.gateway';
import { FrontendCommunicationService } from './frontend-communication.service';

@Module({
  providers: [FrontendCommunicationGateway, FrontendCommunicationService],
  exports: [FrontendCommunicationGateway],
})
export class FrontendCommunicationModule {}

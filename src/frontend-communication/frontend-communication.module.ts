import { Module } from '@nestjs/common';
import { FrontendCommunicationGateway } from './frontend-communication.gateway';
import { FrontendCommunicationService } from './frontend-communication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientBet, ClientBetSchema } from '../schemas/client-bet.schema';
import { ClientBetRepository } from '../repositories/client-bet.repository';
import { GameInfoRepository } from '../repositories/game-info.repository';
import { BetResultRepository } from '../repositories/bet-result.repository';
import { GameInfo, GameInfoSchema } from '../schemas/game-info.schema';
import { BetResult, BetResultSchema } from '../schemas/bet-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientBet.name, schema: ClientBetSchema },
      { name: GameInfo.name, schema: GameInfoSchema },
      { name: BetResult.name, schema: BetResultSchema },
    ]),
  ],
  providers: [
    FrontendCommunicationGateway,
    FrontendCommunicationService,
    ClientBetRepository,
    GameInfoRepository,
    BetResultRepository,
  ],
  exports: [FrontendCommunicationGateway],
})
export class FrontendCommunicationModule {}

import { Module } from '@nestjs/common';
import { BetGateway } from './websocket/bet.gateway';
import { BetService } from './bet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GameInfoRepository } from '../repositories/game-info.repository';
import { BetResultRepository } from '../repositories/bet-result.repository';
import { GameInfo, GameInfoSchema } from '../schemas/game-info.schema';
import { BetResult, BetResultSchema } from '../schemas/bet-result.schema';
import { BetController } from './bet.controller';
import { CurrentGameModule } from './common/current-game.module';
import { BetHelperService } from './websocket/bet-helper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameInfo.name, schema: GameInfoSchema },
      { name: BetResult.name, schema: BetResultSchema },
    ]),
    CurrentGameModule,
  ],
  providers: [
    BetGateway,
    BetService,
    GameInfoRepository,
    BetResultRepository,
    BetHelperService,
  ],
  exports: [BetGateway],
  controllers: [BetController],
})
export class BetModule {}

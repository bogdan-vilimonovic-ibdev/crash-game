import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GameInfo, GameInfoDocument } from '../schemas/game-info.schema';
import { Model } from 'mongoose';

@Injectable()
export class GameInfoRepository {
  constructor(
    @InjectModel(GameInfo.name) private gameInfoModel: Model<GameInfoDocument>,
  ) {}

  async create(gameInfo: GameInfo): Promise<GameInfo> {
    const newGameInfo = new this.gameInfoModel(gameInfo);
    return newGameInfo.save();
  }
}

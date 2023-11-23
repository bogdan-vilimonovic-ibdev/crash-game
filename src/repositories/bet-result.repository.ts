import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BetResult, BetResultDocument } from '../schemas/bet-result.schema';
import { Model } from 'mongoose';

@Injectable()
export class BetResultRepository {
  constructor(
    @InjectModel(BetResult.name)
    private betResultModel: Model<BetResultDocument>,
  ) {}

  async create(betResult: BetResult): Promise<BetResult> {
    const newBetResult = new this.betResultModel(betResult);
    return newBetResult.save();
  }
}

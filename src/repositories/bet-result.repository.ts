import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BetResult, BetResultDocument } from '../schemas/bet-result.schema';
import { FilterQuery, Model } from 'mongoose';

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

  async find(
    betResultsFilterQuery: FilterQuery<BetResult>,
  ): Promise<BetResult[]> {
    return this.betResultModel.find(betResultsFilterQuery);
  }

  async findOne(
    betResultFilterQuery: FilterQuery<BetResult>,
  ): Promise<BetResult> {
    return this.betResultModel.findOne(betResultFilterQuery);
  }

  async findOneAndUpdate(
    betResultFilterQuery: FilterQuery<BetResult>,
    betResult: Partial<BetResult>,
  ): Promise<BetResult> {
    return this.betResultModel.findOneAndUpdate(
      betResultFilterQuery,
      betResult,
      {
        new: true,
      },
    );
  }
}

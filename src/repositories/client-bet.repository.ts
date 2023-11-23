import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientBet, ClientBetDocument } from '../schemas/client-bet.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class ClientBetRepository {
  constructor(
    @InjectModel(ClientBet.name)
    private clientBetModel: Model<ClientBetDocument>,
  ) {}

  async findOne(
    clientBetFilterQuery: FilterQuery<ClientBet>,
  ): Promise<ClientBet> {
    return this.clientBetModel.findOne(clientBetFilterQuery);
  }

  async find(
    clientBetsFilterQuery: FilterQuery<ClientBet>,
  ): Promise<ClientBet[]> {
    return this.clientBetModel.find(clientBetsFilterQuery);
  }

  async create(clientBet: ClientBet): Promise<ClientBet> {
    const newclientBet = new this.clientBetModel(clientBet);
    return newclientBet.save();
  }

  async deleteOne(clientBetFilterQuery: FilterQuery<ClientBet>): Promise<void> {
    await this.clientBetModel.deleteOne(clientBetFilterQuery);
  }

  async reset(): Promise<void> {
    await this.clientBetModel.deleteMany({});
  }
}

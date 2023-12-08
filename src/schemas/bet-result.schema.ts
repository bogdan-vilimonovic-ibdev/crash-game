import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BetResultDocument = BetResult & Document;

@Schema()
export class BetResult {
  @Prop()
  gameId: string;

  @Prop()
  clientId: string;

  @Prop()
  amount: number;

  @Prop()
  won: boolean;

  @Prop()
  selectedMultiplier: number;

  @Prop()
  createdAt: number;

  @Prop()
  updatedAt: number;
}

export const BetResultSchema = SchemaFactory.createForClass(BetResult);

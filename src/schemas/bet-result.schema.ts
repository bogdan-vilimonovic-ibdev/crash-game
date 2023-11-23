import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BetResultDocument = BetResult & Document;

@Schema()
export class BetResult {
  @Prop()
  gameId: string;

  @Prop()
  userId: string;

  @Prop()
  bet: number;

  @Prop()
  won: boolean;

  @Prop()
  selectedMultiplier: number;
}

export const BetResultSchema = SchemaFactory.createForClass(BetResult);

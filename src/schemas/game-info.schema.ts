import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameInfoDocument = GameInfo & Document;

@Schema()
export class GameInfo {
  @Prop()
  gameId: string;

  @Prop()
  multiplier: number;

  @Prop()
  startedAt: number;

  @Prop()
  endedAt: number;
}

export const GameInfoSchema = SchemaFactory.createForClass(GameInfo);

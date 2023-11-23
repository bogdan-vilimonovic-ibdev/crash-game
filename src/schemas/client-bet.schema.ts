import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientBetDocument = ClientBet & Document;

@Schema()
export class ClientBet {
  @Prop()
  clientId: string;

  @Prop()
  bet: number;
}

export const ClientBetSchema = SchemaFactory.createForClass(ClientBet);

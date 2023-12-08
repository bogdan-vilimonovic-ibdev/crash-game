import { IsNotEmpty, IsNumber } from 'class-validator';

export class BetDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

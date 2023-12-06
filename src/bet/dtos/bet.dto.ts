import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BetDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

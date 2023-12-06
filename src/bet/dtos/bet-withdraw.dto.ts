import { IsNotEmpty, IsString } from 'class-validator';

export class BetWithdrawDto {
  @IsNotEmpty()
  @IsString()
  clientId: string;
}

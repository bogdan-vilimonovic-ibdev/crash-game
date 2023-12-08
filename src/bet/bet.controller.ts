import { Body, Controller, Post, Res } from '@nestjs/common';
import { BetDto } from './dtos/bet.dto';
import { AuthMiddlewareData } from '../middleware/middleware.interfaces';
import { BetService } from './bet.service';

@Controller('bet')
export class BetController {
  constructor(private betService: BetService) {}

  @Post('place-bet')
  async placeBet(
    @Body() data: BetDto,
    @Res({ passthrough: true }) response: AuthMiddlewareData,
  ) {
    return await this.betService.placeBet(response.locals.user.id, data.amount);
  }

  @Post('bet-withdrawal')
  async betWithdrawal(
    @Res({ passthrough: true }) response: AuthMiddlewareData,
  ) {
    return await this.betService.betWithdrawal(response.locals.user.id);
  }
}

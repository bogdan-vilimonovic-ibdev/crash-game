import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CurrentState } from './common/current-state.service';
import { GameState } from '../enums/game-state.enum';
import { BetDto } from './dtos/bet.dto';
import { BetResultRepository } from '../repositories/bet-result.repository';

@Controller('bet')
export class BetController {
  constructor(
    private currentState: CurrentState,
    private betResultRepository: BetResultRepository,
  ) {}

  @Post('place-bet')
  async placeBet(@Body() data: BetDto) {
    if (this.currentState.state !== GameState.AcceptingBets) {
      throw new HttpException(
        'Time for placing bets is over',
        HttpStatus.BAD_REQUEST,
      );
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId: data.clientId,
    });

    if (clientBet) {
      throw new HttpException(
        'Bet has already been placed',
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdAt = Date.now();
    this.betResultRepository.create({
      gameId: this.currentState.gameId,
      clientId: clientBet.clientId,
      bet: clientBet.bet,
      won: false,
      selectedMultiplier: 0,
      createdAt,
      updatedAt: null,
    });
  }

  @Post('bet-withdrawal')
  async betWithdrawal(@Body() clientId: string) {
    if (this.currentState.state !== GameState.SendingMultiplier) {
      throw new HttpException('Cannot withdraw', HttpStatus.BAD_REQUEST);
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId,
      gameId: this.currentState.gameId,
    });
    if (!clientBet) {
      throw new HttpException(
        'You did not place a bet',
        HttpStatus.BAD_REQUEST,
      );
    }

    const reward = clientBet.bet * (this.currentState.multiplier / 100);

    const updatedAt = Date.now();
    this.betResultRepository.findOneAndUpdate(
      { clientId, gameId: this.currentState.gameId },
      {
        won: true,
        selectedMultiplier: this.currentState.multiplier / 100,
        updatedAt,
      },
    );

    return { reward };
  }
}

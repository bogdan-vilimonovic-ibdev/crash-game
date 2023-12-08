import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CurrentGame } from './common/current-game.service';
import { GameState } from '../enums/game-state.enum';
import { BetDto } from './dtos/bet.dto';
import { BetResultRepository } from '../repositories/bet-result.repository';
import { BetWithdrawDto } from './dtos/bet-withdraw.dto';

@Controller('bet')
export class BetController {
  constructor(
    private currentGame: CurrentGame,
    private betResultRepository: BetResultRepository,
  ) {}

  @Post('place-bet')
  async placeBet(@Body() data: BetDto) {
    if (this.currentGame.state !== GameState.AcceptingBets) {
      throw new BadRequestException('Time for placing bets is over');
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId: data.clientId,
      gameId: this.currentGame.gameId,
    });

    if (clientBet) {
      throw new BadRequestException('Bet has already been placed');
    }

    const createdAt = Date.now();
    this.betResultRepository.create({
      gameId: this.currentGame.gameId,
      clientId: data.clientId,
      bet: data.amount,
      won: false,
      selectedMultiplier: 0,
      createdAt,
      updatedAt: null,
    });

    return 'Bet Placed';
  }

  @Post('bet-withdrawal')
  async betWithdrawal(@Body() betWithdrawDto: BetWithdrawDto) {
    if (this.currentGame.state !== GameState.SendingMultiplier) {
      throw new BadRequestException('Cannot withdraw');
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId: betWithdrawDto.clientId,
      gameId: this.currentGame.gameId,
    });
    if (!clientBet) {
      throw new BadRequestException('You did not place a bet');
    }

    const reward = clientBet.bet * (this.currentGame.multiplier / 100);

    const updatedAt = Date.now();
    this.betResultRepository.findOneAndUpdate(
      {
        clientId: betWithdrawDto.clientId,
        gameId: this.currentGame.gameId,
      },
      {
        won: true,
        selectedMultiplier: this.currentGame.multiplier / 100,
        updatedAt,
      },
    );

    return 'Your reward is: ' + reward;
  }
}

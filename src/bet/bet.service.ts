import { BadRequestException, Injectable } from '@nestjs/common';
import { CurrentGame } from './common/current-game.service';
import { BetResultRepository } from '../repositories/bet-result.repository';
import { GameState } from '../enums/game-state.enum';

@Injectable()
export class BetService {
  constructor(
    private currentGame: CurrentGame,
    private betResultRepository: BetResultRepository,
  ) {}

  async placeBet(clientId: string, betAmount: number) {
    if (this.currentGame.state !== GameState.AcceptingBets) {
      throw new BadRequestException('Time for placing bets is over');
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId: clientId,
      gameId: this.currentGame.gameId,
    });

    if (clientBet) {
      throw new BadRequestException('Bet has already been placed');
    }

    const createdAt = Date.now();
    this.betResultRepository.create({
      gameId: this.currentGame.gameId,
      clientId: clientId,
      amount: betAmount,
      won: false,
      selectedMultiplier: 0,
      createdAt,
      updatedAt: null,
    });

    return 'Bet Placed';
  }

  async betWithdrawal(clientId: string) {
    if (this.currentGame.state !== GameState.SendingMultiplier) {
      throw new BadRequestException('Cannot withdraw');
    }

    const clientBet = await this.betResultRepository.findOne({
      clientId: clientId,
      gameId: this.currentGame.gameId,
    });
    if (!clientBet) {
      throw new BadRequestException('You did not place a bet');
    }

    const reward = clientBet.amount * (this.currentGame.multiplier / 100);

    const updatedAt = Date.now();
    this.betResultRepository.findOneAndUpdate(
      {
        clientId: clientId,
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

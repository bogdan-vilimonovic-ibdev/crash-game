import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BetService } from './bet.service';
import { GameState } from '../enums/game-state.enum';
import { v4 as uuidv4 } from 'uuid';
import { GameInfoRepository } from '../repositories/game-info.repository';
import { CurrentGame } from './common/current-game.service';

@WebSocketGateway()
export class BetGateway implements OnGatewayInit {
  constructor(
    private service: BetService,
    private readonly gameInfoRepository: GameInfoRepository,
    private currentGame: CurrentGame,
  ) {}

  @WebSocketServer() server: Server;

  afterInit() {
    this.gameLoop();
  }

  async gameLoop() {
    while (true) {
      await this.gameInit();
      await this.getMultiplier();
    }
  }

  async gameInit() {
    this.currentGame.state = GameState.AcceptingBets;

    this.currentGame.gameId = uuidv4();

    this.server.emit('getMultiplier', 'Place your bet');

    await this.service.delay(10000);
  }

  async getMultiplier() {
    this.currentGame.state = GameState.SendingMultiplier;

    const multiplier = this.service.getCrashPoint();

    const startedAt = Date.now();

    const replyDelay = { value: 100 };
    for (
      this.currentGame.multiplier = 100;
      this.currentGame.multiplier <= multiplier * 100;
      this.currentGame.multiplier++
    ) {
      this.server.emit('getMultiplier', this.currentGame.multiplier / 100);

      this.service.shortenDelayTime(replyDelay, this.currentGame.multiplier);

      await this.service.delay(replyDelay.value);
    }

    if (multiplier === 1) {
      this.server.emit('getMultiplier', multiplier);
    }

    const endedAt = Date.now();

    this.gameInfoRepository.create({
      gameId: this.currentGame.gameId,
      multiplier,
      startedAt,
      endedAt,
    });

    this.server.emit('getMultiplier', 'Game Ended');
  }
}

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
import { BetResultRepository } from '../repositories/bet-result.repository';
import { CurrentState } from './common/current-state.service';

@WebSocketGateway()
export class BetGateway implements OnGatewayInit {
  constructor(
    private service: BetService,
    private readonly gameInfoRepository: GameInfoRepository,
    private readonly betResultRepository: BetResultRepository,
    private currentState: CurrentState,
  ) {}

  @WebSocketServer() server: Server;

  afterInit() {
    this.gameLoop();
  }

  async gameLoop() {
    while (true) {
      await this.getMultiplier();
    }
  }

  async getMultiplier() {
    this.currentState.gameId = uuidv4();

    this.currentState.state = GameState.AcceptingBets;

    this.server.emit('getMultiplier', 'Place your bet');

    await this.service.delay(10000);

    this.currentState.state = GameState.SendingMultiplier;

    const multiplier = this.service.getCrashPoint();

    const startedAt = Date.now();

    const replyDelay = { value: 100 };
    for (
      this.currentState.multiplier = 100;
      this.currentState.multiplier < multiplier * 100;
      this.currentState.multiplier++
    ) {
      this.server.emit('getMultiplier', this.currentState.multiplier / 100);

      this.service.shortenDelayTime(replyDelay, this.currentState.multiplier);

      await this.service.delay(replyDelay.value);
    }

    const endedAt = Date.now();

    this.gameInfoRepository.create({
      gameId: this.currentState.gameId,
      multiplier,
      startedAt,
      endedAt,
    });

    this.server.emit('getMultiplier', 'Game Ended');
  }
}

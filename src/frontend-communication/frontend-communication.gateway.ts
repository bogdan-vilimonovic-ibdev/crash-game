import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FrontendCommunicationService } from './frontend-communication.service';
import { ClientBet } from '../model/client-bet.model';
import { GameState } from '../enum/game-state.enum';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@WebSocketGateway()
export class FrontendCommunicationGateway implements OnGatewayInit {
  constructor(
    private service: FrontendCommunicationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @WebSocketServer() server: Server;
  clientBets: ClientBet[] = [];
  private currentMultiplier: number;
  private currentState: GameState;

  afterInit() {
    this.gameLoop();
  }

  async gameLoop() {
    while (true) {
      await this.getMultiplier();
      await this.playersLossManagment();
      this.currentState = GameState.AcceptingBets;
      this.server.emit('getMultiplier', 'Place your bet');
      await this.service.delay(5000);
    }
  }

  async getMultiplier() {
    this.currentState = GameState.SendingMultiplier;

    const multiplier = this.service.getCrashPoint();

    let replyDelay = 100;
    for (
      this.currentMultiplier = 100;
      this.currentMultiplier < multiplier * 100;
      this.currentMultiplier++
    ) {
      this.server.emit('getMultiplier', this.currentMultiplier / 100);

      if (replyDelay > 50 && this.currentMultiplier % 5 == 0) {
        replyDelay -= 4;
      }
      await this.service.delay(replyDelay);
    }
  }

  async playersLossManagment() {
    this.currentState = GameState.SendingBetsLoss;

    this.clientBets.forEach((clientBet) => {
      const clientSocket = this.server.sockets.sockets.get(clientBet.clientId);
      clientSocket.emit('betManagment', 'you lost');
      //to do: integration
      //money from user wallet -> casino wallet
    });

    this.clientBets = [];
  }

  @SubscribeMessage('betManagment')
  betManagment(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    if (this.currentState !== GameState.AcceptingBets) {
      client.emit('betManagment', 'Time for placing bets is over');
      return;
    }

    data = JSON.parse(data);

    if (
      !this.clientBets.some((clientBet) => clientBet.clientId === client.id)
    ) {
      this.clientBets.push(new ClientBet(client.id, data.bet));
    }
  }

  @SubscribeMessage('playerWithdraw')
  playerWithdraw(@ConnectedSocket() client: Socket) {
    if (this.currentState !== GameState.SendingMultiplier) {
      client.emit('playerWithdraw', 'Cannot withdraw');
      return;
    }

    const clientBet = this.clientBets.find(
      (clientBet) => clientBet.clientId === client.id,
    );

    const reward = clientBet.bet * (this.currentMultiplier / 100);

    client.emit('playerWithdraw', 'You won: ' + reward);

    //to do: integration
    //money from casino wallet -> user wallet

    this.clientBets = this.clientBets.filter(
      (clientBet) => clientBet.clientId !== client.id,
    );
  }
}

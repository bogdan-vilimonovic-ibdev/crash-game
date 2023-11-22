import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FrontendCommunicationService } from './frontend-communication.service';
import { ClientBet } from '../model/client-bet.model';
import { GameState } from '../enum/game-state.enum';

@WebSocketGateway()
export class FrontendCommunicationGateway implements OnGatewayInit {
  constructor(private service: FrontendCommunicationService) {}

  @WebSocketServer() server: Server;
  clientBets: ClientBet[] = [];
  currentMultiplier: number;
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
      let currentMultiplier = 100;
      currentMultiplier < multiplier * 100;
      currentMultiplier++
    ) {
      this.currentMultiplier = currentMultiplier / 100;
      this.server.emit('getMultiplier', this.currentMultiplier);

      if (replyDelay > 50 && currentMultiplier % 5 == 0) {
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
      throw new WsException('Time for placing bets is over');
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
      throw new WsException('Cannot withdraw');
    }

    const clientBet = this.clientBets.find(
      (clientBet) => clientBet.clientId === client.id,
    );

    client.emit(
      'playerWithdraw',
      'You won: ' + clientBet.bet * this.currentMultiplier,
    );

    //to do: integration
    //money from casino wallet -> user wallet

    this.clientBets = this.clientBets.filter(
      (clientBet) => clientBet.clientId !== client.id,
    );
  }
}

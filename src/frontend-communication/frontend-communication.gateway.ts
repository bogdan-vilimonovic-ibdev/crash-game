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
import { GameState } from '../enums/game-state.enum';
import { ClientBetRepository } from '../repositories/client-bet.repository';
import { v4 as uuidv4 } from 'uuid';
import { GameInfoRepository } from '../repositories/game-info.repository';
import { BetResultRepository } from '../repositories/bet-result.repository';

@WebSocketGateway()
export class FrontendCommunicationGateway implements OnGatewayInit {
  constructor(
    private service: FrontendCommunicationService,
    private readonly clientBetRepository: ClientBetRepository,
    private readonly gameInfoRepository: GameInfoRepository,
    private readonly betResultRepository: BetResultRepository,
  ) {}

  @WebSocketServer() server: Server;
  private currentMultiplier: number;
  private currentState: GameState;
  gameId: string;

  afterInit() {
    this.gameLoop();
  }

  async gameLoop() {
    while (true) {
      await this.service.delay(10000);
      await this.getMultiplier();
      await this.playersLossManagment();
      this.currentState = GameState.AcceptingBets;
      this.server.emit('getMultiplier', 'Place your bet');
    }
  }

  async getMultiplier() {
    this.currentState = GameState.SendingMultiplier;

    const multiplier = this.service.getCrashPoint();

    this.gameId = uuidv4();
    this.gameInfoRepository.create({
      gameId: this.gameId,
      multiplier: multiplier,
    });

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

    const clientBets = await this.clientBetRepository.find({});

    clientBets.forEach((clientBet) => {
      const clientSocket = this.server.sockets.sockets.get(clientBet.clientId);
      clientSocket.emit('betManagment', 'you lost');

      this.betResultRepository.create({
        gameId: this.gameId,
        userId: clientBet.clientId,
        bet: clientBet.bet,
        won: false,
        selectedMultiplier: 0,
      });

      //to do: integration
      //money from user wallet -> casino wallet
    });

    this.clientBetRepository.reset();
  }

  @SubscribeMessage('betManagment')
  async betManagment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (this.currentState !== GameState.AcceptingBets) {
      client.emit('betManagment', 'Time for placing bets is over');
      return;
    }

    try {
      data = JSON.parse(data);
    } catch (error) {
      client.emit('betManagment', 'Send a valid json object with bet inside');
    }

    const clientBet = await this.clientBetRepository.findOne({
      clientId: client.id,
    });

    if (clientBet) {
      client.emit('betManagment', 'Bet has already been placed');
      return;
    }

    this.clientBetRepository.create({ clientId: client.id, bet: data.bet });
  }

  @SubscribeMessage('playerWithdraw')
  async playerWithdraw(@ConnectedSocket() client: Socket) {
    if (this.currentState !== GameState.SendingMultiplier) {
      client.emit('playerWithdraw', 'Cannot withdraw');
      return;
    }

    const clientBet = await this.clientBetRepository.findOne({
      clientId: client.id,
    });

    if (!clientBet) {
      client.emit('playerWithdraw', 'You did not place a bet');
      return;
    }

    const reward = clientBet.bet * (this.currentMultiplier / 100);

    client.emit('playerWithdraw', 'You won: ' + reward);

    this.betResultRepository.create({
      gameId: this.gameId,
      userId: clientBet.clientId,
      bet: clientBet.bet,
      won: true,
      selectedMultiplier: this.currentMultiplier,
    });

    //to do: integration
    //money from casino wallet -> user wallet

    this.clientBetRepository.deleteOne({ clientId: clientBet.clientId });
  }
}

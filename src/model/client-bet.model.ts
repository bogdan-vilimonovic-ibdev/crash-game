export class ClientBet {
  clientId: string;
  bet: number;

  constructor(clientId: string, bet: number) {
    this.clientId = clientId;
    this.bet = bet;
  }
}

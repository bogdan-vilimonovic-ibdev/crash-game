import { Injectable } from '@nestjs/common';
import { GameState } from '../../enums/game-state.enum';

@Injectable()
export class CurrentState {
  public multiplier: number;
  public state: GameState;
  public gameId: string;
}

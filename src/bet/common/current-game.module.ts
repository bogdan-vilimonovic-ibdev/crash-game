import { Module } from '@nestjs/common';
import { CurrentGame } from './current-game.service';

@Module({
  providers: [CurrentGame],
  exports: [CurrentGame],
})
export class CurrentGameModule {}

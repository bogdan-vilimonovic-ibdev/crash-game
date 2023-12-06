import { Module } from '@nestjs/common';
import { CurrentState } from './current-state.service';

@Module({
  providers: [CurrentState],
  exports: [CurrentState],
})
export class CurrentStateModule {}

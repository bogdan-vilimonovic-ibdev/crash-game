import { Injectable } from '@nestjs/common';

@Injectable()
export class BetHelperService {
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  shortenDelayTime(replyDelay: { value: number }, currentMultiplier: number) {
    if (replyDelay.value > 25 && currentMultiplier % 5 === 0) {
      replyDelay.value -= 4;
    }
  }
}

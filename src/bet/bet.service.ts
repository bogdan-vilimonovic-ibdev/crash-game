import { Injectable } from '@nestjs/common';

@Injectable()
export class BetService {
  getCrashPoint() {
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    // if h % (100 / desired_precentage) is 0 then the game will crash immediately
    // 100 / 2 (2 % casino advantage)
    if (h % 50 == 0) return 1;
    return Math.floor((100 * e - h) / (e - h)) / 100;
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  shortenDelayTime(replyDelay: { value: number }, currentMultiplier: number) {
    if (replyDelay.value > 25 && currentMultiplier % 5 === 0) {
      replyDelay.value -= 4;
    }
  }
}

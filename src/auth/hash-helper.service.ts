import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, createHmac } from 'crypto';
import { User } from './schemas/user.schema';
import { HashTokenReturnData } from './auth.interfaces';
import { Cache } from 'cache-manager';

@Injectable()
export class HashHelperService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}
  hashPassword(password: string): string {
    if (!password) return null;

    const salt = this.configService.get<string>('PASSWORD_SECRET');
    return createHmac('sha512', salt).update(password).digest('hex');
  }

  async hashAndStoreToken(user: User): Promise<HashTokenReturnData> {
    const token = this.jwtService.sign({
      userId: user.id,
    });
    const hashedToken = createHash('sha256').update(token).digest('hex');
    await this.cacheManager.set(hashedToken, token, 10800000);
    const tokenSetAt = new Date().getTime();

    return {
      token: hashedToken,
      expiresAt: tokenSetAt + 10800000,
    };
  }
}

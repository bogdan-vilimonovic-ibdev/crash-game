import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TokenData } from '../auth/auth.interfaces';
import { UserRepository } from '../repositories/user.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    let userData: TokenData;
    let accessToken: string;
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Session expired, please login!');
    }

    try {
      accessToken = req.headers.authorization.split(' ')[1];
      const token = await this.cacheManager.get<string>(accessToken);
      this.jwtService.verify(token);
      userData = this.jwtService.decode(token) as TokenData;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Authentication failure');
    }

    if (!userData) {
      throw new BadRequestException('User not found');
    }
    res.locals.userData = userData;
    res.locals.accessToken = accessToken;
    next();
  }
}

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
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    let tokenData: TokenData;
    let user: User;
    let accessToken: string;
    if (!req.headers.authorization) {
      throw new UnauthorizedException('Session expired, please login!');
    }

    try {
      accessToken = req.headers.authorization.split(' ')[1];
      const token = await this.cacheManager.get<string>(accessToken);
      this.jwtService.verify(token);

      tokenData = this.jwtService.decode(token) as TokenData;
      user = await this.userRepository.findOne({ id: tokenData.userId });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Authentication failure');
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    res.locals.user = user;
    res.locals.accessToken = accessToken;

    next();
  }
}

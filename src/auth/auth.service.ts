import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schemas/user.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HashTokenReturnData } from './auth.interfaces';
import { Cache, Milliseconds } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private configService: ConfigService,
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async login(data: LoginUserDto) {
    let user = await this.userRepository.findOne({
      username: data.username,
    });

    if (!user) {
      throw new BadRequestException('The username does not exist');
    }

    user = await this.userRepository.findOne({
      username: data.username,
      password: this.hashPassword(data.password),
    });

    if (!user) {
      throw new BadRequestException('Incorrect password');
    }

    const tokenData = await this.hashAndStoreToken(user);

    return { user, ...tokenData };
  }

  async register(data: RegisterUserDto) {
    const user = await this.userRepository.findOne({
      username: data.username,
    });

    if (user) {
      throw new BadRequestException('Username already exists');
    }

    const newUser: User = await this.userRepository.create({
      id: uuidv4(),
      username: data.username,
      password: this.hashPassword(data.password),
    });

    const returnUser = { id: newUser.id, username: newUser.username };

    const tokenData = await this.hashAndStoreToken(newUser);

    return { returnUser, ...tokenData };
  }

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

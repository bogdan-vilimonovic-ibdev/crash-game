import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginUserDto } from './dtos/login-user.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRepository } from './repositories/user.repository';
import { User } from './schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { HashHelperService } from './hash-helper.service';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,

    private hashHelperService: HashHelperService,
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
      password: this.hashHelperService.hashPassword(data.password),
    });

    if (!user) {
      throw new BadRequestException('Incorrect password');
    }

    const tokenData = await this.hashHelperService.hashAndStoreToken(user);

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
      password: this.hashHelperService.hashPassword(data.password),
    });

    const returnUser = { id: newUser.id, username: newUser.username };

    const tokenData = await this.hashHelperService.hashAndStoreToken(newUser);

    return { returnUser, ...tokenData };
  }
}

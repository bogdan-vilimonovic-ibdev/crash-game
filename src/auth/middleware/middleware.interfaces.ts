import { Response } from 'express';
import { User } from '../schemas/user.schema';

export interface AuthMiddlewareData extends Response {
  locals: {
    user: User;
    token: string;
  };
}

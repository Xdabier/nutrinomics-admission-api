import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

export interface GenerateTokenRes {
  accessToken: string;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = '2a55fec06efb8212e12dc4b3befdd599';

  decodeToken(token: string): User | null {
    const jwtPayload = verify(token, this.jwtSecret) as JwtPayload;

    if (!jwtPayload) {
      return null;
    }

    return jwtPayload.user;
  }

  generateJWTToken(user: User): GenerateTokenRes {
    const accessToken = sign({ user }, this.jwtSecret, { expiresIn: '7d' });
    const jwtPayload = verify(accessToken, this.jwtSecret) as JwtPayload;

    return {
      exp: jwtPayload.exp,
      accessToken,
    };
  }
}

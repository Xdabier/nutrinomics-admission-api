import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './user.dto';
import { HashingUtils } from '../../utils/hash.util';
import {
  CookieOptions,
  Response as ResponseType,
  Request as RequestType,
} from 'express';
import { AuthService, GenerateTokenRes } from './auth.service';
import * as moment from 'moment';
import { AuthGuard } from './auth.guard';
import { User } from './user.schema';

@Controller('auth')
export class AuthController {
  private readonly cookieOptions: CookieOptions = {
    expires: moment().add(7, 'days').toDate(),
    secure: false,
  };

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async login(
    @Body() payload: Omit<UserDto, '_id' | 'username'>,
    @Res() res: ResponseType,
  ) {
    const user = await this.userService.findOne({ email: payload.email });

    if (!user) {
      const err = `No user found for the email ${payload.email}!`;
      return res.status(404).send(err);
    }

    const hashUtils = new HashingUtils();
    const isRightPassword = hashUtils.verifyPassword(
      payload.password,
      user.password,
    );

    if (!isRightPassword) {
      const err = `Wrong password!`;
      return res.status(400).send(err);
    }

    const tokenRes: GenerateTokenRes = this.authService.generateJWTToken(user);

    const signedRes = res
      .cookie('accessToken', tokenRes.accessToken, {
        ...this.cookieOptions,
        httpOnly: true,
      })
      .cookie('exp', tokenRes.exp, this.cookieOptions);

    const resUser: Partial<User> = {
      email: user.email,
      username: user.username,
    };
    return signedRes.status(200).send(resUser);
  }

  @Post('signup')
  async signup(
    @Body() payload: Omit<UserDto, '_id'>,
    @Res() res: ResponseType,
  ) {
    const userForEmail = await this.userService.findOne({
      email: payload.email,
    });
    const userForUsername = await this.userService.findOne({
      username: payload.username,
    });

    if (userForEmail) {
      const err = `Email ${payload.email} already used!`;
      return res.status(409).send(err);
    }

    if (userForUsername) {
      const err = `Username ${payload.username} already used!`;
      return res.status(409).send(err);
    }

    const user = await this.userService.createUser(payload);

    const tokenRes: GenerateTokenRes = this.authService.generateJWTToken(user);

    const signedRes = res
      .cookie('accessToken', tokenRes.accessToken, {
        ...this.cookieOptions,
        httpOnly: true,
      })
      .cookie('exp', tokenRes.exp, this.cookieOptions);

    const resUser: Partial<User> = {
      email: user.email,
      username: user.username,
    };
    return signedRes.status(200).send(resUser);
  }

  @UseGuards(AuthGuard)
  @Get('current-user')
  async currentUser(@Req() req: RequestType) {
    const token = req.cookies.accessToken as string;
    const userToken: User = this.authService.decodeToken(token) as User;

    return await this.userService.findOne(userToken, true);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Res() res: ResponseType) {
    return res
      .clearCookie('accessToken')
      .clearCookie('exp')
      .set(200)
      .send(true);
  }
}

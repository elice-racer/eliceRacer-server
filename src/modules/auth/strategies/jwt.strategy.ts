import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { ENV_JWT_SECRET_KEY } from '../../../common/const/env.const';
import { TokenPayload } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(ENV_JWT_SECRET_KEY),
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userService.validate(payload.sub);

    return user;
  }
}

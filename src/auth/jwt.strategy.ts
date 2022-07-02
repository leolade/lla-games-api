import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  validate(payload: UserDto): UserDto {
    return {
      displayName: payload.displayName,
      username: payload.username,
      administrator: payload?.administrator,
      uuid: payload?.uuid,
    } as UserDto;
  }
}

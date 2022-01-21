import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import { UsersFacadeService } from '../users/users.facade.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersFacadeService: UsersFacadeService) {
    super();
  }

  validate(username: string, password: string): Observable<UserEntity> {
    return this.usersFacadeService.validate(username, password);
  }
}

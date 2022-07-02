import { Injectable } from '@nestjs/common';
import { UpdateUserNameDto } from 'lla-party-games-dto/dist/update-user-name.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserBusinessService } from './user-business.service';

@Injectable()
export class UsersFacadeService {
  constructor(private userBusinessService: UserBusinessService) {}

  validateUnloggedUser(userId: string): Observable<UnloggedUserEntity> {
    return from(this.userBusinessService.getNamedUnloggedUser(userId));
  }

  createUser(): Observable<string> {
    return from(
      this.userBusinessService
        .getRepository()
        .save({ username: this.userBusinessService.createRandomPlayerName() }),
    ).pipe(
      map((unloggedUserEntity: UnloggedUserEntity) => {
        return unloggedUserEntity.id;
      }),
    );
  }

  getUnloggedUser(token: string): Observable<UserDto> {
    return from(this.userBusinessService.getNamedUnloggedUser(token)).pipe(
      map((unloggedUserEntity: UnloggedUserEntity) => {
        return {
          uuid: unloggedUserEntity.id,
          displayName: unloggedUserEntity.username,
          administrator: false,
          username: unloggedUserEntity.username,
        } as UserDto;
      }),
    );
  }

  saveUserName(
    token: string,
    username: UpdateUserNameDto,
  ): Observable<UserDto> {
    return from(
      this.userBusinessService.saveUserName(token, username.username),
    ).pipe(
      map((unloggedUserEntity: UnloggedUserEntity) => {
        return {
          uuid: unloggedUserEntity.id,
          displayName: unloggedUserEntity.username,
          administrator: false,
          username: unloggedUserEntity.username,
        } as UserDto;
      }),
    );
  }
}

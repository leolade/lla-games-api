import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserBusinessService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UnloggedUserEntity)
    private unloggedUserRepository: Repository<UnloggedUserEntity>,
  ) {}

  getUnloggedUser(uuid: string): Observable<UnloggedUserEntity> {
    return from(this.unloggedUserRepository.findOne(uuid)).pipe(
      switchMap((user: UnloggedUserEntity | undefined) => {
        if (!user) {
          return throwError(() => new Error('Utilisateur inconnu'));
        } else {
          return of(user);
        }
      }),
    );
  }
}

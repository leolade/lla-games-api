import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';

@Injectable()
export class UserBusinessService {
  constructor(
    @InjectRepository(UnloggedUserEntity)
    private unloggedUserRepository: Repository<UnloggedUserEntity>,
  ) {}

  getUnloggedUser(uuid: string): Observable<UnloggedUserEntity> {
    return from(this.unloggedUserRepository.findOneBy({ id: uuid })).pipe(
      switchMap((user: UnloggedUserEntity | undefined) => {
        if (!user) {
          return throwError(() => new Error('Utilisateur inconnu'));
        } else {
          return of(user);
        }
      }),
    );
  }

  saveUserName(uuid: string, username: string): Observable<UnloggedUserEntity> {
    return from(this.unloggedUserRepository.findOneBy({ id: uuid })).pipe(
      switchMap((user: UnloggedUserEntity | undefined) => {
        if (!user) {
          return throwError(() => new Error('Utilisateur inconnu'));
        } else {
          return this.unloggedUserRepository.save({
            ...user,
            username: username || this.createRandomPlayerName(),
          });
        }
      }),
    );
  }

  getNamedUnloggedUser(userId: string): Observable<UnloggedUserEntity> {
    return this.getUnloggedUser(userId).pipe(
      switchMap((user: UnloggedUserEntity) => {
        if (!user.username) {
          return this.unloggedUserRepository.save({
            ...user,
            username: this.createRandomPlayerName(),
          });
        } else {
          return of(user);
        }
      }),
    );
  }

  getRepository(): Repository<UnloggedUserEntity> {
    return this.unloggedUserRepository;
  }

  createRandomPlayerName(): string {
    return `Joueur ${Math.floor(Math.random() * 10000)}`;
  }
}

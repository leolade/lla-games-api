import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConnectUserDto } from 'lla-party-games-dto/dist/connect-user.dto';
import { CreateUserDto } from 'lla-party-games-dto/dist/create-user.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { from, Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Like, Repository } from 'typeorm';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersFacadeService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(UnloggedUserEntity)
    private unloggedUserRepository: Repository<UnloggedUserEntity>,
  ) {}

  hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  comparePassword(
    hashedPassword: string,
    plainTextPassword: string,
  ): Promise<boolean> {
    return compare(plainTextPassword, hashedPassword);
  }

  register(userDto: CreateUserDto): Observable<UserEntity> {
    return from(this.findUserByUsername(userDto.username)).pipe(
      switchMap((user: UserEntity) => {
        if (!user) {
          return this.hashPassword(userDto.password);
        }
        return throwError('');
      }),
      switchMap((hashedPassword: string) => {
        return this.usersRepository.save({
          username: userDto.username,
          displayName: userDto.displayName,
          password: hashedPassword,
        });
      }),
    );
  }

  login(userDto: ConnectUserDto): Observable<boolean> {
    return this.validate(userDto?.username, userDto?.password).pipe(
      map((user: UserEntity) => !!user),
    );
  }

  whoAmI(): string {
    return '';
  }

  validate(username: string, password: string): Observable<UserEntity> {
    return from(this.findUserByUsername(username)).pipe(
      switchMap((user: UserEntity) => {
        return from(this.comparePassword(user?.password, password)).pipe(
          map(() => user),
        );
      }),
    );
  }

  getUnloggedToken(): Observable<string> {
    return from(this.unloggedUserRepository.save({})).pipe(
      map((unloggedUserEntity: UnloggedUserEntity) => {
        return unloggedUserEntity.id;
      }),
    );
  }

  getUnloggedUser(token: string): Observable<UserDto> {
    return from(this.unloggedUserRepository.findOne(token)).pipe(
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

  private findUserByUsername(
    username: string,
  ): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne(undefined, {
      where: { username: Like(`%${username}%`) },
    });
  }
}

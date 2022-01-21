import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { ConnectUserDto } from 'lla-party-games-dto/dist/connect-user.dto';
import { CreateUserDto } from 'lla-party-games-dto/dist/create-user.dto';
import { from, Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UsersFacadeService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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

  private findUserByUsername(
    username: string,
  ): Promise<UserEntity | undefined> {
    return this.usersRepository.findOne(undefined, {
      where: { username: Like(`%${username}%`) },
    });
  }
}

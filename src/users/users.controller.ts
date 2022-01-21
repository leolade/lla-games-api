import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectUserDto } from 'lla-party-games-dto/dist/connect-user.dto';
import { CreateUserDto } from 'lla-party-games-dto/dist/create-user.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { UserEntity } from '../entities/user.entity';
import { UsersFacadeService } from './users.facade.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersFacade: UsersFacadeService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  register(@Body() userDto: CreateUserDto): Observable<string> {
    return this.usersFacade.register(userDto).pipe(
      map((user: UserEntity) =>
        this.jwtService.sign({
          username: user?.username,
          displayName: user.displayName,
          uuid: user.uuid,
          administrator: user?.administrator,
        } as UserDto),
      ),
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Body() userDto: ConnectUserDto,
    @Request() req: Request,
  ): Observable<string> {
    return this.usersFacade.validate(userDto?.username, userDto.password).pipe(
      map((user: UserEntity) =>
        this.jwtService.sign({
          username: user?.username,
          displayName: user.displayName,
          uuid: user.uuid,
          administrator: user?.administrator,
        } as UserDto),
      ),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('who-am-i')
  whoAmI(@Request() req) {
    return req.user;
  }
}

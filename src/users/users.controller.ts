import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedUserDto } from 'lla-party-games-dto/dist/connected-user.dto';
import { UpdateUserNameDto } from 'lla-party-games-dto/dist/update-user-name.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersFacadeService } from './users.facade.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersFacade: UsersFacadeService,
    private jwtService: JwtService,
  ) {}

  @Post('user')
  createUser(): Observable<string> {
    return this.usersFacade.createUser();
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/username')
  updateUsername(
    @Body() username: UpdateUserNameDto,
    @Request() req,
  ): Observable<UserDto> {
    return this.usersFacade.saveUserName((req.user as UserDto).uuid, username);
  }

  @Get('user/:userId')
  getUser(@Param() params): Observable<ConnectedUserDto> {
    return this.usersFacade.getUnloggedUser(params.userId).pipe(
      map((user: UserDto) => {
        return {
          ...user,
          token: this.jwtService.sign({
            username: user?.username,
            displayName: user.displayName,
            uuid: user.uuid,
            administrator: user?.administrator,
            signOptions: { expiresIn: '1s' },
          } as UserDto),
        } as ConnectedUserDto;
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('who-am-i')
  whoAmI(@Request() req): UserDto {
    return {
      ...req.user,
      uuid: undefined,
    };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/jwt.strategy';
import { UnloggedUserEntity } from '../entities/unlogged-user.entity';
import { UserBusinessService } from './user-business.service';
import { UsersController } from './users.controller';
import { UsersFacadeService } from './users.facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnloggedUserEntity]), AuthModule],
  controllers: [UsersController],
  providers: [UsersFacadeService, JwtStrategy, UserBusinessService],
})
export class UsersModule {}

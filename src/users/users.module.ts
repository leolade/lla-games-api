import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/jwt.strategy';
import { LocalStrategy } from '../auth/local.strategy';
import { UserEntity } from '../entities/user.entity';
import { UsersController } from './users.controller';
import { UsersFacadeService } from './users.facade.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  controllers: [UsersController],
  providers: [UsersFacadeService, LocalStrategy, JwtStrategy],
})
export class UsersModule {}

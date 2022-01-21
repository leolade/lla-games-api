import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MotusGameEntity } from './entities/motus-game.entity';
import { MotusPlayerRoundPropositionEntity } from './entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from './entities/motus-player-round.entity';
import { MotusRoundEntity } from './entities/motus-round.entity';
import { UserEntity } from './entities/user.entity';
import { MotModule } from './mot/mot.module';
import { MotusGameModule } from './motus-game/motus-game.module';
import { MotusRoundModule } from './motus-round/motus-round.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.PARTY_GAMES_MYSQL_DATABASE_URL,
      entities: [
        UserEntity,
        MotusGameEntity,
        MotusPlayerRoundEntity,
        MotusPlayerRoundPropositionEntity,
        MotusRoundEntity,
      ],
      logging: true,
      synchronize: true,
    }),
    UsersModule,
    MotModule,
    MotusGameModule,
    MotusRoundModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

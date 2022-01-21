import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusRoundPropositionValidationDto } from 'lla-party-games-dto/dist/motus-round-proposition-validation.dto';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { UserDto } from 'lla-party-games-dto/dist/user.dto';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { MotusRoundEntity } from '../entities/motus-round.entity';

@Injectable()
export class MotusRoundFacadeService {
  constructor(
    @InjectRepository(MotusRoundEntity)
    private motusRoundRepository: Repository<MotusRoundEntity>,
  ) {}

  makeProposition(
    proposition: MotusRoundPropositionDto,
    idRound: string,
    user: UserDto,
  ): Observable<MotusRoundPropositionValidationDto> {
    return undefined;
  }

  makeDailyGameProposition(
    proposition: MotusRoundPropositionDto,
    id,
  ): Observable<MotusRoundPropositionValidationDto> {
    return undefined;
  }

  getRoundWord(id: string): Observable<string> {
    return from(this.motusRoundRepository.findOne(id)).pipe(
      map((round: MotusRoundEntity) => {
        return round.word;
      }),
    );
  }
}

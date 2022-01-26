import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { MotusRoundEntity } from '../../entities/motus-round.entity';

@Injectable()
export class MotusRoundBusinessService {
  constructor(
    @InjectRepository(MotusRoundEntity)
    private motusRoundRepository: Repository<MotusRoundEntity>,
  ) {}

  getRoundById(roundId: string): Observable<MotusRoundEntity> {
    return from(this.motusRoundRepository.findOne(roundId)).pipe(
      switchMap((round: MotusRoundEntity) => {
        if (!round) {
          return throwError(() => new Error());
        }
        return of(round);
      }),
    );
  }
}

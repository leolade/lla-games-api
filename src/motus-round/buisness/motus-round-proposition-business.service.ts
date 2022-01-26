import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MotusRoundPropositionDto } from 'lla-party-games-dto/dist/motus-round-proposition.dto';
import { from, Observable } from 'rxjs';
import { StringUtils } from 'type-script-utils-lla/dist/string.utils';
import { Repository } from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from '../../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../../entities/motus-round.entity';
import { UnloggedUserEntity } from '../../entities/unlogged-user.entity';
import { MotBusinessService } from '../../mot/mot-business/mot-business.service';

@Injectable()
export class MotusRoundPropositionBusinessService {
  constructor(
    @InjectRepository(MotusPlayerRoundPropositionEntity)
    private motusPlayerRoundPropositionRepository: Repository<MotusPlayerRoundPropositionEntity>,
    private motBusiness: MotBusinessService,
  ) {}

  savePropositionDto(
    proposition: MotusRoundPropositionDto,
    playerRound: MotusPlayerRoundEntity,
  ): Observable<MotusPlayerRoundPropositionEntity> {
    return this.saveProposition({
      round: playerRound,
      suggestWord: StringUtils.removeDiacritics(
        proposition.suggestWord,
      ).toUpperCase(),
      encodedValidation: this.validateProposition(
        proposition.suggestWord,
        playerRound.round.word,
      ),
    } as Partial<MotusPlayerRoundPropositionEntity>);
  }

  saveProposition(
    proposition: Partial<MotusPlayerRoundPropositionEntity>,
  ): Observable<MotusPlayerRoundPropositionEntity> {
    return from(this.motusPlayerRoundPropositionRepository.save(proposition));
  }

  private validateProposition(suggestWord: string, word: string): string {
    return this.motBusiness.validate(word, suggestWord);
  }

  getPropositionsForRoundPlayer(
    round: MotusPlayerRoundEntity,
  ): Observable<MotusPlayerRoundPropositionEntity[]> {
    return from(
      this.motusPlayerRoundPropositionRepository.find({
        where: {
          round: round,
        },
        order: {
          createdDate: 'ASC'
        },
        relations: ['round'],
      }),
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { Repository } from 'typeorm';
import { MotusPlayerRoundPropositionEntity } from '../../entities/motus-player-round-proposition.entity';
import { MotusPlayerRoundEntity } from '../../entities/motus-player-round.entity';
import { MotusRoundEntity } from '../../entities/motus-round.entity';
import { ScoreRoundEntity } from '../../entities/score-round.entity';

@Injectable()
export class CalculPointsBusinessService {
  private POINT_TROUVE_PREMIER_TOUR = 60;
  private POINT_MAX_LETTRE_TROUVE = 6;
  private POINT_MAX_LETTRE_BIEN_PLACE = 18;
  private NB_TENTATIVE = 6;

  constructor(
    @InjectRepository(ScoreRoundEntity)
    private scoreRoundRepository: Repository<ScoreRoundEntity>,
  ) {}

  calculatePoints(
    round: MotusRoundEntity,
    propositions: MotusPlayerRoundPropositionEntity[],
  ): [number, [string, number][]] {
    // On rassemble les propositions sous une forme plus simple a traité
    // <numéro_de_proposition, [proposition, validation]>
    const mapIndexPropositionValidation: Map<number, [string, string]> =
      new Map();
    propositions
      .sort(
        (
          p1: MotusPlayerRoundPropositionEntity,
          p2: MotusPlayerRoundPropositionEntity,
        ) => {
          return p1.createdDate.getTime() === p2.createdDate.getTime()
            ? 0
            : p1.createdDate.getTime() > p2.createdDate.getTime()
            ? 1
            : -1;
        },
      )
      .forEach(
        (proposition: MotusPlayerRoundPropositionEntity, index: number) => {
          mapIndexPropositionValidation.set(index, [
            proposition.suggestWord,
            proposition.encodedValidation,
          ]);
        },
      );

    const points: [string, number][] = [];

    this.getRoundParLettreBienPlace(
      round.word,
      mapIndexPropositionValidation,
    ).forEach((roundFind: number, index: number) => {
      if (roundFind != -1) {
        points.push([
          `Lettre ${round.word[index]} bien placé à la proposition ${
            roundFind + 1
          }`,
          this.POINT_MAX_LETTRE_BIEN_PLACE *
            ((this.NB_TENTATIVE - roundFind + 1) / this.NB_TENTATIVE),
        ]);
      }
    });
    this.getRoundParLettreMalPlace(
      round.word,
      mapIndexPropositionValidation,
    ).forEach((roundFind: number, index: number) => {
      if (roundFind != -1) {
        points.push([
          `Lettre ${round.word[index]} trouvé à la proposition ${
            roundFind + 1
          }`,
          this.POINT_MAX_LETTRE_TROUVE *
            ((this.NB_TENTATIVE - roundFind + 1) / this.NB_TENTATIVE),
        ]);
      }
    });

    if (propositions.length <= 5) {
      points.push([
        `Mot trouvé a trouvé à la proposition ${propositions.length}`,
        this.POINT_TROUVE_PREMIER_TOUR *
          ((this.NB_TENTATIVE - propositions.length + 1) / this.NB_TENTATIVE),
      ]);
    }

    return [
      points.reduce((accumulator, pointInfo) => accumulator + pointInfo[1], 0),
      points,
    ];
  }

  saveScore(
    roundPlayer: MotusPlayerRoundEntity,
    points: number,
  ): Observable<ScoreRoundEntity> {
    return from(
      this.scoreRoundRepository.save({
        points: points,
        playerRound: roundPlayer,
      }),
    );
  }

  private getRoundParLettreBienPlace(
    word: string,
    mapIndexPropositionValidation: Map<number, [string, string]>,
  ): number[] {
    const wordUppercased: string = word.toUpperCase();
    return Array.from(wordUppercased).map((lettre: string, index: number) => {
      const mapIndexPropositionValidationItem: [number, [string, string]] =
        Array.from(mapIndexPropositionValidation).find(
          (propositionValidation: [number, [string, string]]) => {
            const validation = propositionValidation[1][1];
            return validation[index] === '+';
          },
        ) as [number, [string, string]];
      return mapIndexPropositionValidationItem
        ? mapIndexPropositionValidationItem[0]
        : -1;
    });
  }

  private getRoundParLettreMalPlace(
    word: string,
    mapIndexPropositionValidation: Map<number, [string, string]>,
  ): number[] {
    const wordUppercased: string = word.toUpperCase();
    return Array.from(wordUppercased).map((lettre: string, index: number) => {
      const compteurOccurenceLettre: number = (
        wordUppercased.substring(0, index + 1).match(new RegExp(lettre, 'g')) ||
        []
      ).length;
      const mapIndexPropositionValidationItem: [number, [string, string]] =
        Array.from(mapIndexPropositionValidation).find(
          (propositionValidation: [number, [string, string]]) => {
            const proposition = propositionValidation[1][0];
            return (
              (proposition.toUpperCase().match(new RegExp(lettre, 'g')) || [])
                .length >= compteurOccurenceLettre
            );
          },
        ) as [number, [string, string]];
      return mapIndexPropositionValidationItem
        ? mapIndexPropositionValidationItem[0]
        : -1;
    });
  }
}

import { Injectable } from '@nestjs/common';
import { createReadStream, ReadStream } from 'fs';
import { createInterface, Interface } from 'readline';
import { from, Observable } from 'rxjs';
import { NumberUtils } from 'type-script-utils-lla/dist/number.utils';
import { StringUtils } from 'type-script-utils-lla/dist/string.utils';

@Injectable()
export class MotBusinessService {
  validate(motAValider: string, motSoumis: string): string {
    let result = '';
    let motCopy = (' ' + motSoumis).slice(1);
    let motADevinerCopy = (' ' + motAValider).slice(1);
    if (motCopy.length != motADevinerCopy.length) {
      throw new Error("Les mots n'ont pas la même taille");
    }

    // On place les lettres bien placés.
    for (let i = 0; i < motCopy.length; i++) {
      if (motCopy[i].toUpperCase() === motADevinerCopy[i].toUpperCase()) {
        result += '+';
        motCopy = StringUtils.replaceAt(motCopy, '+', i);
        motADevinerCopy = StringUtils.replaceAt(motADevinerCopy, '+', i);
      } else {
        result += '?';
      }
    }

    // On place le reste
    for (let i = 0; i < motCopy.length; i++) {
      if (!['?', '.', '-', '+'].includes(motCopy[i])) {
        const indexCorrespondance: number = Array.from(
          motADevinerCopy,
        ).findIndex(
          (char: string) => char.toUpperCase() === motCopy[i].toUpperCase(),
        );
        if (indexCorrespondance >= 0) {
          result = StringUtils.replaceAt(result, '-', i);
          motCopy = StringUtils.replaceAt(motCopy, '-', i);
          motADevinerCopy = StringUtils.replaceAt(
            motADevinerCopy,
            '-',
            indexCorrespondance,
          );
        } else {
          result = StringUtils.replaceAt(result, '.', i);
          motCopy = StringUtils.replaceAt(motCopy, '.', i);
        }
      }
    }

    return result;
  }

  getRandomWords(
    nbLettreMin: number,
    nbLettreMax: number,
    nbWords: number,
  ): Observable<string[]> {
    //On lit un fichier qui contient 1 mot par ligne
    const fileStream: ReadStream = createReadStream('dic.txt');
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    //On lit chaque ligne une à une
    const mots: string[] = [];
    rl.on('line', (input) => {
      // Si le mot correspond à nos critères, alors on l'ajoutes a notre préselection
      if (input.length >= nbLettreMin && input.length <= nbLettreMax) {
        mots.push(input);
      }
    });

    // Quand on a fini de lire, alors on récupères des mots au hasard dans cette liste.
    return from(
      new Promise<string[]>((resolve, reject) => {
        rl.on('close', () => {
          resolve(
            this.getItemsAuHasard(mots, nbWords).map((mot: string) => {
              return StringUtils.removeDiacritics(mot.toUpperCase());
            }),
          );
        });
      }),
    );
  }

  private getItemsAuHasard(mots: string[], nbWords: number): string[] {
    const indexes: number[] = NumberUtils.getRandomInts(
      nbWords,
      0,
      mots.length - 1,
    );
    const results: string[] = [];
    indexes.forEach((index: number) => {
      results.push(mots[index]);
    });
    return results;
  }
}

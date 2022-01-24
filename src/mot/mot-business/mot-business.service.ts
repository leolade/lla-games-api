import { Injectable } from '@nestjs/common';
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
}

import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import {
  createReadStream,
  createWriteStream,
  readdir,
  ReadStream,
  unlink,
  WriteStream,
} from 'fs';
import { ValidateMotDto } from 'lla-party-games-dto/dist/validate-mot.dto';
import path from 'path';
import { createInterface, Interface } from 'readline';
import { from, Observable, Observer, of } from 'rxjs';
import { NumberUtils } from 'type-script-utils-lla/dist/number.utils';
import { StringUtils } from 'type-script-utils-lla/dist/string.utils';

@Injectable()
export class MotFacadeService {
  getRandomWords(
    nbLettreMin: number,
    nbLettreMax: number,
    nbWords: number,
  ): Observable<string[]> {
    const fileStream: ReadStream = createReadStream('dic.txt');
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const mots: string[] = [];
    rl.on('line', (input) => {
      if (input.length >= nbLettreMin && input.length <= nbLettreMax) {
        mots.push(input);
      }
    });
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

  validate(validateMotDTO: ValidateMotDto): Observable<string> {
    let result = '';
    let motCopy = (' ' + validateMotDTO.motSoumis).slice(1);
    let motADevinerCopy = (' ' + validateMotDTO.motAValider).slice(1);
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

    return of(result);
  }

  exist(mot: string): Observable<boolean> {
    if (!mot) {
      return;
    }

    const firstWordLetter: string = StringUtils.removeDiacritics(
      mot.toUpperCase(),
    )[0];

    const fileStream: ReadStream = createReadStream(
      `dictionnaire/${firstWordLetter}.txt`,
    );
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let find = false;
    rl.on('line', (input) => {
      if (
        StringUtils.removeDiacritics(mot.toUpperCase()).trim() ===
        StringUtils.removeDiacritics(input.toUpperCase()).trim()
      ) {
        find = true;
        rl.close();
      }
    });
    return from(
      new Promise<boolean>((resolve, reject) => {
        rl.on('close', () => {
          resolve(find);
        });
      }),
    );
  }

  fillDicByLetter(): Observable<void> {
    readdir('dictionnaire', (err, files) => {
      if (err) throw err;

      for (const file of files) {
        unlink(path.join('dictionnaire', file), (err) => {
          if (err) throw err;
        });
      }
    });

    const fileStream: ReadStream = createReadStream('dicv2.txt');
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const mapStream: Map<string, WriteStream> = new Map<string, WriteStream>();

    rl.on('line', (input) => {
      let fileToWrite: WriteStream;
      const firstWordLetter: string = StringUtils.removeDiacritics(
        input.toUpperCase(),
      )[0];
      if (mapStream.has(firstWordLetter)) {
        fileToWrite = mapStream.get(firstWordLetter);
        fileToWrite.write('\n' + input);
      } else {
        fileToWrite = createWriteStream(`dictionnaire/${firstWordLetter}.txt`, {
          flags: 'a',
        });
        mapStream.set(firstWordLetter, fileToWrite);
        fileToWrite.write(input);
      }
    });

    return from(
      new Promise<void>((resolve, reject) => {
        mapStream.forEach((value: WriteStream) => {
          value.end();
        });
        resolve();
      }),
    );
  }

  incoherence(): Observable<string[]> {
    const fileStream: ReadStream = createReadStream('dic.txt');
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const mots: string[] = [];
    rl.on('line', (input) => {
      if (!this.exist(input)) {
        console.log(input);
        mots.push(input);
      }
    });
    return from(
      new Promise<string[]>((resolve, reject) => {
        rl.on('close', () => {
          resolve(mots);
        });
      }),
    );
  }

  existCSV(mot: string): Observable<boolean> {
    const parser = parse({ delimiter: ':' });
    let find = false;
    const stream = createReadStream('dictionnaire/A.txt').pipe(parser);

    stream.on('data', function (csvrow) {
      if (
        StringUtils.removeDiacritics(mot.toUpperCase()).trim() ===
        StringUtils.removeDiacritics(csvrow[0].toUpperCase()).trim()
      ) {
        find = true;
        parser.end();
      }
    });

    return from(
      new Promise<boolean>((resolve, reject) => {
        stream.on('end', function () {
          resolve(find);
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

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
import { from, Observable, of } from 'rxjs';
import { StringUtils } from 'type-script-utils-lla/dist/string.utils';
import { MotBusinessService } from './mot-business/mot-business.service';

@Injectable()
export class MotFacadeService {
  constructor(private motBusiness: MotBusinessService) {}

  getRandomWords(
    nbLettreMin: number,
    nbLettreMax: number,
    nbWords: number,
  ): Observable<string[]> {
    return this.motBusiness.getRandomWords(nbLettreMin, nbLettreMax, nbWords);
  }

  validate(validateMotDTO: ValidateMotDto): Observable<string> {
    return of(
      this.motBusiness.validate(
        validateMotDTO.motAValider,
        validateMotDTO.motSoumis,
      ),
    );
  }

  exist(mot: string): Observable<boolean> {
    if (!mot) {
      return;
    }

    const firstWordLetter: string = StringUtils.removeDiacritics(
      mot.toUpperCase(),
    )[0];

    //On lit un fichier qui contient 1 mot par ligne
    const fileStream: ReadStream = createReadStream(
      `dictionnaire/${firstWordLetter}.txt`,
    );
    const rl: Interface = createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let find = false;
    //On lit chaque ligne une à une
    rl.on('line', (input) => {
      if (
        StringUtils.removeDiacritics(mot.toUpperCase()).trim() ===
        StringUtils.removeDiacritics(input.toUpperCase()).trim()
      ) {
        // Si on trouve notre mot, on s'arrête la.
        find = true;
        rl.close();
      }
    });

    // On renvoi la valeur de si oui ou non le mot existe
    return from(
      new Promise<boolean>((resolve) => {
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
      new Promise<void>((resolve) => {
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
      new Promise<string[]>((resolve) => {
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
      new Promise<boolean>((resolve) => {
        stream.on('end', function () {
          resolve(find);
        });
      }),
    );
  }
}

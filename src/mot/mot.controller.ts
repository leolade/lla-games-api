import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ValidateMotDto } from 'lla-party-games-dto/dist/validate-mot.dto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MotFacadeService } from './mot.facade.service';

@Controller('mot')
export class MotController {
  constructor(private motFacadeService: MotFacadeService) {}

  @Get('random/:nbLettreMin/:nbLettreMax/:nbRandom')
  getRandomWordsWithSpecificLength(@Param() params): Observable<string[]> {
    return this.motFacadeService.getRandomWords(
      params.nbLettreMin,
      params.nbLettreMax,
      params.nbRandom,
    );
  }

  @Get('random/:nbLettreMin/:nbLettreMax')
  getRandomWordWithSpecificLength(@Param() params): Observable<string> {
    return this.motFacadeService
      .getRandomWords(params.nbLettreMin, params.nbLettreMax, 1)
      .pipe(map((s: string[]) => s[0]));
  }

  @Get('random/:nbRandom')
  getRandomWords(@Param() params): Observable<string[]> {
    return this.motFacadeService.getRandomWords(5, 9, params.nbRandom);
  }

  @Get('random')
  getRandomWord(@Param() params): Observable<string> {
    return this.motFacadeService
      .getRandomWords(5, 9, 1)
      .pipe(map((s: string[]) => s[0]));
  }

  @Post('validate')
  valiadteWord(@Body() validateMotDTO: ValidateMotDto): Observable<string> {
    return this.motFacadeService.validate(validateMotDTO);
  }

  @Get('exist/:mot')
  exist(@Param() params): Observable<boolean> {
    return this.motFacadeService.exist(params.mot);
  }

  @Get('exist/csv/:mot')
  existCSV(@Param() params): Observable<boolean> {
    return this.motFacadeService.existCSV(params.mot);
  }

  @Get('fill-dic')
  fillDic(@Param() params): Observable<void> {
    return this.motFacadeService.fillDicByLetter();
  }

  @Get('incoherence')
  incoherence(@Param() params): Observable<string[]> {
    return this.motFacadeService.incoherence();
  }
}

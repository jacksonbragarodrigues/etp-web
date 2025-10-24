import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, lastValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RetornoConsultaProcedimentoDTO } from '../dto/retornoConsultaProcedimentoDTO.model';

@Injectable({ providedIn: 'root' })
export class SeiService {
  apiSeiUrl: string = `${environment.apiFormulario}/sei`;

  constructor(private httpClient: HttpClient) {}

  public async pesquisaProcesso(
    processo: string
  ): Promise<RetornoConsultaProcedimentoDTO | undefined | null> {
    if (processo && processo !== '') {
      let proc = processo.replace('STJ', '');
      proc = proc.replace(' ', '');
      let array = proc.split('/');
      let anoDocumento: string, numDocumento: string;
      numDocumento = array[0];
      if (
        array.length === 2 &&
        array[1] !== undefined &&
        array[1] !== null &&
        array[1] !== ''
      ) {
        anoDocumento = array[1];
      } else {
        anoDocumento = String(new Date().getFullYear());
      }
      if (
        numDocumento &&
        numDocumento !== '' &&
        anoDocumento &&
        anoDocumento !== ''
      ) {
        return await lastValueFrom(
          this.findProcesso(numDocumento, anoDocumento).pipe(
            map((data) => {
              return data;
            })
          )
        );
      }
    }
    return undefined;
  }

  /**
   * Formata e retorna o número do documento no formato "0000/AAAA".
   *
   * @param anoNumDocumento O número do documento no formato "ANNN/AAAA".
   * @returns O número do documento formatado ou null se a entrada for inválida.
   */
  public setaNumeroDocumento(anoNumDocumento: string): string | null {
    if (anoNumDocumento && anoNumDocumento !== '') {
      let proc = anoNumDocumento;

      let array = proc.split('/');
      let anoDocumento: string, numDocumento: string;
      numDocumento = array[0];

      if (numDocumento.length === 1) numDocumento = '000' + numDocumento;
      else if (numDocumento.length == 2) numDocumento = '00' + numDocumento;
      else if (numDocumento.length == 3) numDocumento = '0' + numDocumento;

      if (
        array.length === 2 &&
        array[1] !== undefined &&
        array[1] !== null &&
        array[1] !== ''
      )
        anoDocumento = array[1];
      else {
        anoDocumento = String(new Date().getFullYear());
      }
      return numDocumento + '/' + anoDocumento;
    }

    return null;
  }

  /**
   * Busca um processo pelo seu número e ano.
   *
   * @param numero O número do processo.
   * @param ano O ano do processo.
   * @returns Um Observable que contém um array de objetos {@link RetornoConsultaProcedimentoDTO}.
   */
  findProcesso(
    numero: string,
    ano: string
  ): Observable<RetornoConsultaProcedimentoDTO | null> {
    return this.httpClient
      .get<RetornoConsultaProcedimentoDTO | null>(
        `${this.apiSeiUrl}/numero/${numero}/ano/${ano}`
      )
      .pipe(
        catchError((error) => {
          // Aqui você pode lidar com o erro e decidir o que retornar em caso de falha.
          console.debug('Ocorreu um erro:', error.error.userMessage);
          return of(null); // Retorna null em caso de erro
        })
      );
  }
}

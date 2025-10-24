import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompararHtmlservice {
  apiCompararHtmlUrl: string = `${environment.apiFormulario}/textcomparison`;

  constructor(private http: HttpClient) {}

  compararVersaoHtml(
    id1: number,
    id2: number,
    ckeck1: boolean,
    ckeck2: boolean
  ) {
    return this.http.post<any>(`${this.apiCompararHtmlUrl}/versoes/comparar`, {
      idFormulario1: id1,
      idFormulario2: id2,
      showNotas: true,
      checkFormulario1: ckeck1,
      checkFormulario2: ckeck2,
    });
  }

  compararVersaoHtmlEtp(
    id1: number,
    id2: number,
    ckeck1: boolean,
    ckeck2: boolean
  ) {
    return this.http.post<any>(
      `${this.apiCompararHtmlUrl}/versoes/comparar/etp`,
      {
        idEtp1: id1,
        idEtp2: id2,
        showNotas: true,
        checkEtp1: ckeck1,
        checkEtp2: ckeck2,
      }
    );
  }

  compararVersaoHtmlFormulario(
    id1: number,
    id2: number,
    ckeck1: boolean,
    ckeck2: boolean
  ) {
    return this.http.post<any>(
      `${this.apiCompararHtmlUrl}/versoes/comparar/formulario`,
      {
        idEtp1: id1,
        idEtp2: id2,
        showNotas: true,
        checkEtp1: ckeck1,
        checkEtp2: ckeck2,
      }
    );
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FichaAnaliseAnalistasService {
  apiEtpUrl: string = `${environment.apiFormulario}/etp-ficha-analise-analistas`;

  constructor(private http: HttpClient) {}

  getFichaAnaliseAnalistas(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpUrl}`, { params });
  }

  getAllFichaAnaliseAnalistas() {
    return this.http.get(`${this.apiEtpUrl}/lista`);
  }

  getAnalistasFichaAnalise(idEtpFichaAnalise: any) {
    return this.http.get(
      `${this.apiEtpUrl}/analista-ficha-analise/${idEtpFichaAnalise}`
    );
  }

  postFichaAnaliseAnalistas(fichaAnalise: any) {
    return this.http.post(`${this.apiEtpUrl}`, fichaAnalise);
  }

  postInBLockFichaAnaliseAnalistas(fichaAnaliseAnalistas: any[]) {
    return this.http.post(`${this.apiEtpUrl}/in-block`, fichaAnaliseAnalistas);
  }

  putInBLockFichaAnaliseAnalistas(
    idEtpFichaAnalise: any,
    fichaAnaliseAnalistas: any[]
  ) {
    console.log(
      'Blocking analysts for analysis sheet:',
      idEtpFichaAnalise,
      fichaAnaliseAnalistas
    );
    return this.http.put(
      `${this.apiEtpUrl}/in-block/${idEtpFichaAnalise}`,
      fichaAnaliseAnalistas
    );
  }

  putFichaAnaliseAnalistas(
    idEtpFichaAnaliseAnalistas: any,
    fichaAnaliseAnalistas: any
  ) {
    return this.http.put(
      `${this.apiEtpUrl}/${idEtpFichaAnaliseAnalistas}`,
      fichaAnaliseAnalistas
    );
  }

  deleteFichaAnaliseAnalistas(analista: any) {
    return this.http.delete(
      `${this.apiEtpUrl}/${analista.idFichaAnalise}/${analista.tipoPermissao}/${analista.codMatricula}`
    );
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EtpUnidadeAnaliseService {
  apiEtpUrl: string = `${environment.apiFormulario}/unidades-analise`;

  constructor(private http: HttpClient) {}

  getUnidadeAnalise(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpUrl}`, { params });
  }

  getUnidadeAnalisePorTipoContratacao(idTipoLicitacao: any) {
    return this.http.get(
      `${this.apiEtpUrl}/unidade-analise-tipo-licitacao/${idTipoLicitacao}`
    );
  }

  getAllUnidadeAnalise() {
    return this.http.get(`${this.apiEtpUrl}/lista`);
  }

  postUnidadeAnalise(idUnidadeAnalise: any) {
    return this.http.post(`${this.apiEtpUrl}`, idUnidadeAnalise);
  }

  putUnidadeAnalise(idUnidadeAnalise: any, unidadeAnalise: any) {
    return this.http.put(
      `${this.apiEtpUrl}/${idUnidadeAnalise}`,
      unidadeAnalise
    );
  }

  deleteUnidadeAnalise(idUnidadeAnalise: any) {
    return this.http.delete(`${this.apiEtpUrl}/${idUnidadeAnalise}`);
  }
}

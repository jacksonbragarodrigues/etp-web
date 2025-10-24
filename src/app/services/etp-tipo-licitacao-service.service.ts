import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EtpTipoLicitacaoService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getEtpTipoLicitacaoLista(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiFormularioUrl}/etp-tipo-licitacao/lista`
    );
  }

  getEtpTipoLicitacao(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/etp-tipo-licitacao`, {
      params,
    });
  }

  postEtpTipoLicitacao(etpTipoLicitacao: any) {
    return this.http.post(
      `${this.apiFormularioUrl}/etp-tipo-licitacao`,
      etpTipoLicitacao
    );
  }

  putEtpTipoLicitacao(idEtpTipoLicitacao: any, etpTipoLicitacao: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/etp-tipo-licitacao/${idEtpTipoLicitacao}`,
      etpTipoLicitacao
    );
  }

  deleteEtpTipoLicitacao(idEtpTipoLicitacao: any) {
    return this.http.delete(
      `${this.apiFormularioUrl}/etp-tipo-licitacao/${idEtpTipoLicitacao}`
    );
  }
}

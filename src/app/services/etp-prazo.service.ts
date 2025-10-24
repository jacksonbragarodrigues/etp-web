import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EtpPrazoService {
  apiEtpUrl: string = `${environment.apiFormulario}/etp-prazo`;

  constructor(private http: HttpClient) {}

  getPrazo(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpUrl}`, { params });
  }

  getPrazoPorTipoContratacao(idTipoLicitacao: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiEtpUrl}/etp-prazo-tipo-licitacao/${idTipoLicitacao}`
    );
  }

  getAllPrazo() {
    return this.http.get(`${this.apiEtpUrl}/lista`);
  }

  postPrazo(idPrazo: any) {
    return this.http.post(`${this.apiEtpUrl}`, idPrazo);
  }

  putPrazo(idPrazo: any, prazo: any) {
    return this.http.put(`${this.apiEtpUrl}/${idPrazo}`, prazo);
  }

  deletePrazo(idPrazo: any) {
    return this.http.delete(`${this.apiEtpUrl}/${idPrazo}`);
  }
}

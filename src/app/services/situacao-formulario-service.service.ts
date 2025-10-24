import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SituacaoFormularioServiceService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getSituacaoFormulario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/situacao/lista`);
  }

  getSituacao(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/situacao`, { params });
  }

  postSituacao(situacao: any) {
    return this.http.post(`${this.apiFormularioUrl}/situacao`, situacao);
  }

  putSituacao(idSituacao: any, situacao: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/situacao/${idSituacao}`,
      situacao
    );
  }

  deleteSituacao(idSituacao: any) {
    return this.http.delete(`${this.apiFormularioUrl}/situacao/${idSituacao}`);
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TipoDelegacaoService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getTipoDelegacaoLista(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/tipos-delegacao/lista`);
  }

  getTipoDelegacao(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/tipos-delegacao`, { params });
  }

  postTipoDelegacao(assunto: any) {
    return this.http.post(`${this.apiFormularioUrl}/tipos-delegacao`, assunto);
  }

  putTipoDelegacao(idAssunto: any, assunto: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/tipos-delegacao/${idAssunto}`,
      assunto
    );
  }

  deleteTipoDelegacao(idAssunto: any) {
    return this.http.delete(`${this.apiFormularioUrl}/tipos-delegacao/${idAssunto}`);
  }
}

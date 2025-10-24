import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PrioridadeService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getPrioridadeFormulario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/prioridade/lista`);
  }

  getPrioridade(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/prioridade`, { params });
  }

  postPrioridade(prioridade: any) {
    return this.http.post(`${this.apiFormularioUrl}/prioridade`, prioridade);
  }

  putPrioridade(idPrioridade: any, prioridade: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/prioridade/${idPrioridade}`,
      prioridade
    );
  }

  deletePrioridade(idPrioridade: any) {
    return this.http.delete(
      `${this.apiFormularioUrl}/prioridade/${idPrioridade}`
    );
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DelegacaoAcessoService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getDelegacaoAcesso(id: any, delegacaoAcesso: any): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiFormularioUrl}/delegacao-acesso/${delegacaoAcesso}/${id}`);
  }

  postDelegacaoAcesso(delegacaoAcesso: any) {
    return this.http.post(`${this.apiFormularioUrl}/delegacao-acesso`, delegacaoAcesso);
  }

  deleteDelegacaoAcesso(idDelegacao: any) {
    return this.http.delete(`${this.apiFormularioUrl}/delegacao-acesso/${idDelegacao}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadeService {

  apiUnidadeUrl: string = `${environment.apiFormulario}/tabelas`;

  constructor(
    private http: HttpClient
    ) { }

  getUnidade(indAtribuicaoUnidade: any) : Observable<any>{
    return this.http.get(`${this.apiUnidadeUrl}/unidades/busca-unidade-por-atribuicao/${indAtribuicaoUnidade}`);
  }

  getUnidadeExterna(cpf: any) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUnidadeUrl}/unidade/unidade-externa/cpf/${cpf}/`);
  }

  getDadosUnidade(seqIdUnidade: any) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUnidadeUrl}/unidades/${seqIdUnidade}/`);
  }
}

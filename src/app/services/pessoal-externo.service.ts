import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PessoalExternoService {

  apiPessoaExternaUrl: string = `${environment.apiFormulario}/pessoal-externo-service/pessoal-externo`

  constructor(
    private http: HttpClient
    ) { }

  getDadosPessoalExternaByNome(nome: string) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiPessoaExternaUrl}/nome/${nome}`);
  }

  getDadosPessoalExternaByDescricaoNickName(descricaoNickName: string) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiPessoaExternaUrl}/descricaoNickName/${descricaoNickName}`);
  }

  getDadosPessoalExternaByNickName(nickname: string) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiPessoaExternaUrl}/nickname/${nickname}`);
  }

  getDadosPessoalExternaBycpf(cpf: string) : Observable<any>{
    return this.http.get<any>(`${this.apiPessoaExternaUrl}/cpf/${cpf}`);
  }

  getDadosPessoalExternaFilter(objParams: any) {
    const params = new HttpParams({ fromObject: objParams});
    return this.http.get(`${this.apiPessoaExternaUrl}`, { params });
  }

  postPessoalExterno(objPessoalExterno: any){
    return this.http.post(`${this.apiPessoaExternaUrl}`, objPessoalExterno);
  }

  putPessoalExterno(id: any, objPessoalExterno: any){
    return this.http.put(`${this.apiPessoaExternaUrl}/id/${id}`, objPessoalExterno);
  }

  deletePessoalExterno(id: number) {
    return this.http.delete(`${this.apiPessoaExternaUrl}/id/${id}`);
  }

  getDadosPessoalExterna(nome: string) : Observable<any[]>{
    return this.http.get<any[]>(`${this.apiPessoaExternaUrl}/nome/${nome}`);
  }

}

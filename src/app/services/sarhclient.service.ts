import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Sarhclientservice {
  apiSarhClientUrl: string = `${environment.apiFormulario}/sarhclient`;

  constructor(private http: HttpClient) {}

  getListaUnidades() {
    return this.http.get<any[]>(
      `${this.apiSarhClientUrl}/listaunidades?limit=100000`
    );
  }

  getServidoresPorUnidade(seqUnidade: any) {
    return this.http.get<any[]>(
      `${this.apiSarhClientUrl}/servidor-por-unidade/${seqUnidade}`
    )
  }

  getServidoresPorNome(nome: any) {
    return this.http.get<any[]>(
      `${this.apiSarhClientUrl}/servidor-por-nome/${nome}`
    )
  }
  getServidoresPorMatricula(codMatricula: any) {
    return this.http.get<any[]>(
      `${this.apiSarhClientUrl}/servidor-por-matricula/${codMatricula}`
    )
  }


}

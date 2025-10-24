import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ServidorService {
  apiDadosServidorUrl: string = environment.apiFormulario;

  constructor(private http: HttpClient) {}

  getDadosServidor(nome: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/nome/${nome}`
    );
  }
  getDadosServidorPelaMatricula(matricula: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/matricula/${matricula}`
    );
  }
  getGestorTitularSubstituto(seqUnidade: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiDadosServidorUrl}/dados-servidor/dadosbasicosservidor/titularsubstituto/unidade/${seqUnidade}`
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FormularioSeiService {
  apiEtpSeiUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getListaFormularioSeiPorFormulario(idFormulario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiEtpSeiUrl}/formulariosei/lista/${idFormulario}`);
  }
}

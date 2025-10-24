import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssuntoFormularioServiceService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getAssuntoFormulario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/assunto/lista`);
  }

  getAssunto(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/assunto`, { params });
  }

  postAssunto(assunto: any) {
    return this.http.post(`${this.apiFormularioUrl}/assunto`, assunto);
  }

  putAssunto(idAssunto: any, assunto: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/assunto/${idAssunto}`,
      assunto
    );
  }

  deleteAssunto(idAssunto: any) {
    return this.http.delete(`${this.apiFormularioUrl}/assunto/${idAssunto}`);
  }

  putAssuntoJsonPadrao(idAssunto: any, assuntoJsonPadrao: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/assunto/json/${idAssunto}`,
      assuntoJsonPadrao
    );
  }
}

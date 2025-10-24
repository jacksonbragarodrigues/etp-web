import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RotulosFormularioService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getRotulosFormulario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/rotulos/lista`);
  }

  getRotulos(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/rotulos`, { params });
  }

  postRotulos(rotulos: any) {
    return this.http.post(`${this.apiFormularioUrl}/rotulos`, rotulos);
  }

  putRotulos(idRotulos: any, rotulos: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/rotulos/${idRotulos}`,
      rotulos
    );
  }

  deleteRotulos(idRotulos: any) {
    return this.http.delete(`${this.apiFormularioUrl}/rotulos/${idRotulos}`);
  }
}

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GestaoFormularioService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getFormulario(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/formulario`, { params });
  }

  getFormularioById(id: any) {
    return this.http.get(`${this.apiFormularioUrl}/formulario/${id}`);
  }

  getFormularioTodasVersoes(id: any) {
    return this.http.get<any[]>(
      `${this.apiFormularioUrl}/formulario/todas-versoes/${id}`
    );
  }

  getFormularioListaBloqueados() {
    return this.http.get<any[]>(
      `${this.apiFormularioUrl}/formulario/bloqueados`
    );
  }

  getTodosFormularios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/formulario/lista`);
  }

  getFormulariosPublicados(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiFormularioUrl}/formulario/lista/publicados`
    );
  }

  postFormulario(formulario: any) {
    return this.http.post(`${this.apiFormularioUrl}/formulario`, formulario);
  }

  putFormulario(idFormulario: any, formulario: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/formulario/${idFormulario}`,
      formulario
    );
  }

  putBloqueioFormulario(idFormulario: any, formularioBloqueioInput: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/formulario/bloquear/${idFormulario}`,
      formularioBloqueioInput
    );
  }

  putFormularioJson(idFormulario: any, formulario: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/formulario/json/${idFormulario}`,
      formulario
    );
  }

  patchFormulario(idFormulario: any, acaoSituacao: any) {
    const acao = '"' + acaoSituacao + '"';
    return this.http.patch(
      `${this.apiFormularioUrl}/formulario/${idFormulario}`,
      acao
    );
  }

  deleteFormulario(idFormulario: any) {
    return this.http.delete(
      `${this.apiFormularioUrl}/formulario/${idFormulario}`
    );
  }

  copiarFormulario(idFormulario: any) {
    return this.http.post(
      `${this.apiFormularioUrl}/formulario/copiar/${idFormulario}`,
      {}
    );
  }

  versionarFormulario(idFormulario: any, motivo?: any) {
    return this.http.post(
      `${this.apiFormularioUrl}/formulario/versionar/${idFormulario}`,
      { motivo: motivo }
    );
  }

  consultarUltimaVersaoFormulario(idFormulario: any) {
    return this.http.get(
      `${this.apiFormularioUrl}/formulario/ultima-versao/${idFormulario}`,
      {}
    );
  }

  getTodasVersoesFormulario(idFormulario: any, objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(
      `${this.apiFormularioUrl}/formulario/versoes/${idFormulario}`,
      { params }
    );
  }
}

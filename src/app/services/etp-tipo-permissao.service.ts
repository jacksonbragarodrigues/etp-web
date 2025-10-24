import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EtpTipoPermissaoService {
  apiEtpTipoPermissaoUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getEtpTipoPermissaoList(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/lista`
    );
  }

  getEtpTipoPermissao(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpTipoPermissaoUrl}/etp-tipo-permissao`, {
      params,
    });
  }


  postEtpTipoPermissao(EtpTipoPermissao: any) {
    return this.http.post(
      `${this.apiEtpTipoPermissaoUrl}/etp-tipo-permissao`,
      EtpTipoPermissao
    );
  }

  putEtpTipoPermissao(idEtpTipoPermissao: any, EtpTipoPermissao: any) {
    return this.http.put(
      `${this.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/${idEtpTipoPermissao}`,
      EtpTipoPermissao
    );
  }

  deleteEtpTipoPermissao(idEtpTipoPermissao: any) {
    return this.http.delete(
      `${this.apiEtpTipoPermissaoUrl}/etp-tipo-permissao/${idEtpTipoPermissao}`
    );
  }
}

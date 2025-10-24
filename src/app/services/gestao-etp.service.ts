import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GestaoEtpService {
  apiEtpUrl: string = `${environment.apiFormulario}/gestao-etp`;

  constructor(private http: HttpClient) {}

  getEtpTodasVersoes(id: any) {
    return this.http.get<any[]>(`${this.apiEtpUrl}/todas-versoes/${id}`);
  }

  getLogsEtp(id: any) {
    return this.http.get<any[]>(`${this.apiEtpUrl}/buscarLogs/${id}`);
  }

  getEtp(objParams: any) {
    return this.http.post(`${this.apiEtpUrl}/listar`, objParams);
  }

  postBloquearAnalise(idEtp: any, acao: any) {
    return this.http.post(
      `${this.apiEtpUrl}/bloquearanalise/${idEtp}/${acao}`,
      {}
    );
  }

  putBloqueioEtp(idEtp: any, etpBloqueioInput: any) {
    return this.http.put(
      `${this.apiEtpUrl}/bloquear/${idEtp}`,
      etpBloqueioInput
    );
  }

  getEtpLista() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/lista`);
  }

  getEtpListaBloqueados() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/bloqueados`);
  }

  getEtpById(id: any) {
    return this.http.get(`${this.apiEtpUrl}/${id}`);
  }

  consultarDadosServidorPorLoginEtp() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/lista/servidores`);
  }

  postEtp(etp: any) {
    return this.http.post(`${this.apiEtpUrl}`, etp);
  }
  putEtp(idEtp: any, etp: any) {
    etp.formulario = etp.formulario?.id ? etp.formulario.id : etp.formulario;
    etp.situacao = etp.situacao?.id ? etp.situacao.id : etp.situacao;
    etp.tipoLicitacao = etp.tipoLicitacao?.id
      ? etp.tipoLicitacao.id
      : etp.tipoLicitacao;

    return this.http.put(`${this.apiEtpUrl}/${idEtp}`, etp);
  }

  patchNextEtp(idEtp: any, Etp: any) {
    return this.http.patch(`${this.apiEtpUrl}/next/${idEtp}`, Etp);
  }

  putDadosEtp(idEtp: any, etp: any) {
    return this.http.put(`${this.apiEtpUrl}/json/${idEtp}`, etp);
  }

  deleteEtp(idEtp: any) {
    return this.http.delete(`${this.apiEtpUrl}/${idEtp}`);
  }

  patchEtp(etpId: any, acaoSituacao: any) {
    const acao = '"' + acaoSituacao + '"';
    return this.http.patch(`${this.apiEtpUrl}/${etpId}`, acao);
  }

  copiarEtp(etpId: any) {
    return this.http.post(`${this.apiEtpUrl}/copiar/${etpId}`, {});
  }

  versionarEtp(etpId: any, motivo?: any) {
    return this.http.post(`${this.apiEtpUrl}/versionar/${etpId}`, {
      motivo: motivo,
    });
  }

  patchFormularioEtp(etpId: any, idFormulario: any) {
    return this.http.patch(
      `${this.apiEtpUrl}/formulario/${etpId}`,
      idFormulario
    );
  }

  getTodasVersoesEtp(idEtp: any, objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpUrl}/versoes/${idEtp}`, { params });
  }

  getDadosServidorLogado() {
    return this.http.get<any>(`${this.apiEtpUrl}/dados-servidor`);
  }
}

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GestaoEtpAnaliseService {
  apiEtpUrl: string = `${environment.apiFormulario}/gestao-etp-analise`;

  constructor(private http: HttpClient) {}

  getEtpAnaliseTodasVersoes(id: any) {
    return this.http.get<any[]>(`${this.apiEtpUrl}/todas-versoes/${id}`);
  }

  getLogsEtpAnalise(id: any) {
    return this.http.get<any[]>(`${this.apiEtpUrl}/buscarLogs/${id}`);
  }

  getEtpAnalise(objParams: any) {
    return this.http.post(`${this.apiEtpUrl}/listar`, objParams);
  }

  postBloquearAnaliseEtpAnalise(idEtp: any, acao: any) {
    return this.http.post(
      `${this.apiEtpUrl}/bloquearanalise/${idEtp}/${acao}`,
      {}
    );
  }

  putBloqueioEtpAnalise(idEtp: any, etpBloqueioInput: any) {
    return this.http.put(
      `${this.apiEtpUrl}/bloquear/${idEtp}`,
      etpBloqueioInput
    );
  }

  getEtpAnaliseLista() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/lista`);
  }

  getEtpAnaliseListaBloqueados() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/bloqueados`);
  }

  getEtpAnaliseById(id: any) {
    return this.http.get(`${this.apiEtpUrl}/${id}`);
  }

  consultarDadosServidorPorLoginEtpAnalise() {
    return this.http.get<any[]>(`${this.apiEtpUrl}/lista/servidores`);
  }

  postEtpAnalise(etp: any) {
    return this.http.post(`${this.apiEtpUrl}`, etp);
  }
  putEtpAnalise(idEtp: any, etp: any) {
    etp.formulario = etp.formulario?.id ? etp.formulario.id : etp.formulario;
    etp.situacao = etp.situacao?.id ? etp.situacao.id : etp.situacao;
    etp.tipoLicitacao = etp.tipoLicitacao?.id
      ? etp.tipoLicitacao.id
      : etp.tipoLicitacao;

    return this.http.put(`${this.apiEtpUrl}/${idEtp}`, etp);
  }

  patchNextEtpAnalise(idEtp: any, Etp: any) {
    return this.http.patch(`${this.apiEtpUrl}/next/${idEtp}`, Etp);
  }

  putDadosEtpAnalise(idEtp: any, etp: any) {
    return this.http.put(`${this.apiEtpUrl}/json/${idEtp}`, etp);
  }

  deleteEtpAnalise(idEtp: any) {
    return this.http.delete(`${this.apiEtpUrl}/${idEtp}`);
  }

  patchEtpAnalise(etpId: any, acaoSituacao: any) {
    const acao = '"' + acaoSituacao + '"';
    return this.http.patch(`${this.apiEtpUrl}/${etpId}`, acao);
  }

  alteraEtpEtapaAnalise(etpId: any, acaoSituacao: any) {
    const acao = '"' + acaoSituacao + '"';
    return this.http.patch(`${this.apiEtpUrl}/altera-etapa/${etpId}`, acao);
  }

  copiarEtpAnalise(etpId: any) {
    return this.http.post(`${this.apiEtpUrl}/copiar/${etpId}`, {});
  }

  versionarEtpAnalise(etpId: any, motivo?: any) {
    return this.http.post(`${this.apiEtpUrl}/versionar/${etpId}`, {
      motivo: motivo,
    });
  }

  patchFormularioEtpAnalise(etpId: any, idFormulario: any) {
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

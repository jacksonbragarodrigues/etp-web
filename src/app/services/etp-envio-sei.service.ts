import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EtpEnvioSeiService {
  etpEnvioSeiUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  enviarSei(dadosEnvioSei: any) {
    return this.http.post(
      `${this.etpEnvioSeiUrl}/etpenviosei/enviaretp`,
      dadosEnvioSei
    );
  }

  updateEtpSei(dadosEnvioSei: any) {
    return this.http.patch(
      `${this.etpEnvioSeiUrl}/etpenviosei/updateenviosei`,
      dadosEnvioSei
    );
  }

  consultarECriarDocumentoSei(dadosProcedimento: any) {
    return this.http.post(
      `${this.etpEnvioSeiUrl}/etpenviosei/procedimentosei`,
      dadosProcedimento
    );
  }

  enviarFormularioSei(dadosEnvioSei: any) {
    return this.http.post(
      `${this.etpEnvioSeiUrl}/etpenviosei/enviarformulario`,
      dadosEnvioSei
    );
  }

  consultarDocumentoSei(dadosProcedimento: any) {
    return this.http.post(
      `${this.etpEnvioSeiUrl}/etpenviosei/consultar-procedimentosei`,
      dadosProcedimento
    );
  }
}

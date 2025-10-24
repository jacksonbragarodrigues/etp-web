import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TemplateHtmlService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  geradorPDF(formularioId: number): any {
    const headers = new HttpHeaders();

    return this.http.get(
      `${this.apiFormularioUrl}/formulario/gerador-pdf/` + formularioId,
      { headers, responseType: 'blob' }
    );
  }

  geradorPDFFormularioCompleto(formularioId: number): any {
    const headers = new HttpHeaders();

    return this.http.get(
      `${this.apiFormularioUrl}/formulario/gerador-pdf-completo/` +
        formularioId,
      { headers, responseType: 'blob' }
    );
  }

  geradorPDFEtp(etpId: number, usarSigilo: boolean): any {
    const headers = new HttpHeaders();

    return this.http.get(
      `${this.apiFormularioUrl}/formulario/gerador-pdf/etp/${etpId}/${usarSigilo}`,
      { headers, responseType: 'blob' }
    );
  }

  geradorPDFEtpAnalise(etpId: number, usarSigilo: boolean): any {
    const headers = new HttpHeaders();

    return this.http.get(
      `${this.apiFormularioUrl}/formulario/gerador-pdf/etp-analise/${etpId}/${usarSigilo}`,
      { headers, responseType: 'blob' }
    );
  }
}

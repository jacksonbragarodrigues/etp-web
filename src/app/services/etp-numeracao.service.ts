import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EtpNumeracaoService {

  apiEtpNumeracaoUrl: string = `${environment.apiFormulario}/etp-numeracao`;

  constructor(private http: HttpClient) {}

  postEtpNumeracao(etpNumeracao: any) {
    return this.http.post(`${this.apiEtpNumeracaoUrl}`, etpNumeracao)
  }

  putEtpNumeracao(etpNumeracaoId:any ,etpNumeracao: any) {
    return this.http.put(`${this.apiEtpNumeracaoUrl}/${etpNumeracaoId}`,
      etpNumeracao)
  }

  getUltimoNumeroEtpPorAno(ano: any) {
    return this.http.get(`${this.apiEtpNumeracaoUrl}/${ano}`)
  }

  getNumeroEtp(idEtp:any, ano: any) {
    return this.http.get(`${this.apiEtpNumeracaoUrl}/${idEtp}/${ano}`)
  }

  deleteEtpNumeracao(etpNumeracaoId: any) {
    return this.http.delete(`${this.apiEtpNumeracaoUrl}/${etpNumeracaoId}`)
  }


  getEtpNumeracao(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpNumeracaoUrl}/etp-numeracao`, { params });
  }
}

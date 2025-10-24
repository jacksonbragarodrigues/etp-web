import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FichaAnaliseService {

  apiEtpUrl: string = `${environment.apiFormulario}/etp-ficha-analise`;


  constructor(private http: HttpClient) { }

  getFichaAnalise(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiEtpUrl}`, { params });
  }

  getFichaAnalisePorEtp(idEtp: any) {
    return this.http.get(`${this.apiEtpUrl}/ficha-analise-etp/${idEtp}`);
  }

  getAllFichaAnalise() {
    return this.http.get(`${this.apiEtpUrl}/lista`);
  }

  postFichaAnalise(idFichaAnalise: any) {
    return this.http.post(`${this.apiEtpUrl}`, idFichaAnalise);
  }

  putFichaAnalise(idFichaAnalise: any, fichaAnalise: any) {
    return this.http.put(
      `${this.apiEtpUrl}/${idFichaAnalise}`,
      fichaAnalise
    );
  }

  deleteFichaAnalise(idFichaAnalise: any) {
    return this.http.delete(`${this.apiEtpUrl}/${idFichaAnalise}`);
  }

}

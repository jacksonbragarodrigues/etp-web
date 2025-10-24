import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EtpEtapaService {
  apiFormularioUrl: string = `${environment.apiFormulario}`;

  constructor(private http: HttpClient) {}

  getEtpEtapaLista(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiFormularioUrl}/etp-etapa/lista`);
  }

  getEtpEtapa(objParams: any) {
    const params = new HttpParams({ fromObject: objParams });
    return this.http.get(`${this.apiFormularioUrl}/etp-etapa`, {
      params,
    });
  }

  postEtpEtapa(etpEtapa: any) {
    return this.http.post(`${this.apiFormularioUrl}/etp-etapa`, etpEtapa);
  }

  putEtpEtapa(idEtpEtapa: any, etpEtapa: any) {
    return this.http.put(
      `${this.apiFormularioUrl}/etp-etapa/${idEtpEtapa}`,
      etpEtapa
    );
  }

  deleteEtpEtapa(idEtpEtapa: any) {
    return this.http.delete(`${this.apiFormularioUrl}/etp-etapa/${idEtpEtapa}`);
  }
}

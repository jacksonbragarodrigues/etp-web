import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AtualizaDadosRelatorioService {

  public jsonFormSubject = new BehaviorSubject<any>(null);
  public jsonForm$ = this.jsonFormSubject.asObservable();

  public jsonDadosSubject = new BehaviorSubject<any>(null);
  public jsonDados$ = this.jsonDadosSubject.asObservable();


  updateJsonFormRelatorio(data: any) {
    this.jsonFormSubject.next(data);
  }
  updateJsonDadosRelatorio(data: any) {
    this.jsonDadosSubject.next(data);
  }
}

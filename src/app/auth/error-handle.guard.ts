import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { ErrorService } from '../shared/service/error.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandleGuard {
  constructor(private router: Router, private errorService: ErrorService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Verificar se há um erro armazenado no serviço
    this.errorService.resetInterceptedError();
    const interceptedError = this.errorService.getInterceptedError();

    if (interceptedError && interceptedError.status === 403) {
      // Resetar o erro após a utilização

      // Redirecionar para a página de acesso negado
      this.router.navigateByUrl('/acesso-negado');
      // Retornar falso para bloquear a navegação
      return of(false);
    }
    // Permitir a navegação se não houver erro
    return of(true);
  }
}

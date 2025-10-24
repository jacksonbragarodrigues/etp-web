import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private interceptedError: HttpErrorResponse | null = null;
  private bloqueiaPagina: boolean = false;

  setInterceptedError(error: HttpErrorResponse | null): void {
    this.interceptedError = error;
  }

  getInterceptedError(): HttpErrorResponse | null {
    return this.interceptedError;
  }

  resetInterceptedError(): void {
    this.interceptedError = null;
  }
  
}

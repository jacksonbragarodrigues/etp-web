import {
  AdministrativoComponentsModule,
  BlockSpinnerInterceptor,
} from '@administrativo/components';
import {
  AppErrorHandler,
  AuthInterceptor,
  ENVIRONMENTER,
} from '@administrativo/core';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler,
  LOCALE_ID,
  NgModule,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import {
  DatePipe,
  LocationStrategy,
  PathLocationStrategy,
  registerLocaleData,
} from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import localePt from '@angular/common/locales/pt';
import { ErrorInterceptor } from './shared/interceptor/error-interceptor';
import { VersionCheckInterceptor } from 'src/app/shared/interceptor/version-check.interceptor';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [AppComponent],
  imports: [
    RouterModule,
    AdministrativoComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
      },
    }),
  ],
  providers: [
        DatePipe,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BlockSpinnerInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: VersionCheckInterceptor, multi: true },
    { provide: 'LOGIN_CONFIG', useValue: { tema: 'STJ' } },
    {
      provide: 'AuthServiceConfig',
      useValue: { config: environment.controleAcesso },
    },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: ENVIRONMENTER, useValue: environment },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}

export function tokenGetter() {
  return sessionStorage.getItem('token');
}

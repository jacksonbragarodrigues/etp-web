import { AuthService, LogErrorService } from '@administrativo/core';
import { CUSTOM_ELEMENTS_SCHEMA, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { PrincipalModule } from './pages/principal/principal.module';
import { SituacaoModule } from './pages/situacao/situacao.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from "@angular/router";
import { AlertUtils } from 'src/utils/alerts.util';
import { environment } from 'src/environments/environment';
import { NotificacaoService } from '@administrativo/components';

describe('AppComponent', () => {

  const alertUtilsMock = {
    okModalDialog: jasmine.createSpy('okModalDialog').and.returnValue(Promise.resolve()),
  };

  const ENVIRONMENTER = new InjectionToken<any>('Environmenter');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), PrincipalModule, SituacaoModule, HttpClientTestingModule],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['dadosUsuarioLogado', 'estaAutenticado']) },
        { provide: AlertUtils, useValue: alertUtilsMock },
        { provide: NotificacaoService, useValue: jasmine.createSpyObj('NotificacaoService', ['notificar']) },
        { provide: LogErrorService, useValue: jasmine.createSpyObj('LogErrorService', ['logarErro']) },
        { provide: ENVIRONMENTER, useValue: environment },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

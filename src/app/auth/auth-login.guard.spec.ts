import { TestBed } from '@angular/core/testing';

import { AuthService } from '@administrativo/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AlertUtils } from 'src/utils/alerts.util';
import { PessoalExternoService } from '../services/pessoal-externo.service';
import { UnidadeService } from '../services/uniade-service.service';
import { AuthLoginGuard } from './auth-login.guard';

describe('AuthLoginGuard', () => {
  let guard: AuthLoginGuard;
  let authService: AuthService;
  let pessoalExternoService: PessoalExternoService;
  let unidadeService: UnidadeService;
  let alertUtil: AlertUtils;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthLoginGuard,
        {
          provide: AuthService,
          useValue: {
            isLoggedLoginUnico() {},
            logout() {},
            getStorage() {
              return {
                getItem: () => {
                  return {
                    token: { cpf: '12345678910' },
                  };
                },
              };
            },
          },
        },
        {
          provide: PessoalExternoService,
        },
        {
          provide: UnidadeService,
        },
        {
          provide: AlertUtils,
          useValue: { okModalDialog(message: any) {} },
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigateByUrl']),
        },
      ],
    });

    guard = TestBed.inject(AuthLoginGuard);
    authService = TestBed.inject(AuthService);
    pessoalExternoService = TestBed.inject(PessoalExternoService);
    unidadeService = TestBed.inject(UnidadeService);
    alertUtil = TestBed.inject(AlertUtils);
    router = TestBed.inject(Router);
  });

  // Cenário 1: Permitir a navegação quando o usuário está autenticado e tem uma unidade externa sob responsabilidade
  it('deve permitir a navegação quando o usuário está autenticado e tem uma unidade externa sob responsabilidade', async () => {
    spyOn(authService, 'isLoggedLoginUnico').and.returnValue(true);
    spyOn(pessoalExternoService, 'getDadosPessoalExternaBycpf').and.returnValue(
      of({
        cpf: '123.456.789-00',
        dataAtualizacao: '2024-04-17T10:30:00',
        descricaoNickName: 'JJ',
        fone: '+55 (11) 99999-9999',
        fornecedor: 42,
        id: 1,
        nome: 'João da Silva',
        nomeLogin: 'jsilva',
        rg: '12.345.678-9',
      })
    );
    spyOn(guard, 'getDecodedAccessToken').and.returnValue({
      token: { cpf: '12345678910' },
    });
    spyOn(unidadeService, 'getUnidadeExterna').and.returnValue(of([{ id: 1 }]));
    spyOn(alertUtil, 'okModalDialog').and.returnValue(Promise.resolve(true));
    const result = await guard.canActivate();

    expect(result).toBe(true);
  });

  // Cenário 2: Bloquear a navegação e chamar handleException quando o usuário está autenticado, mas não tem uma unidade externa sob responsabilidade
  it('deve bloquear a navegação e chamar handleException quando o usuário está autenticado, mas não tem uma unidade externa sob responsabilidade', async () => {
    spyOn(authService, 'isLoggedLoginUnico').and.returnValue(true);
    spyOn(guard, 'getDecodedAccessToken').and.returnValue({
      token: { cpf: '12345678910' },
    });
    spyOn(pessoalExternoService, 'getDadosPessoalExternaBycpf').and.returnValue(
      of(null)
    );
    spyOn(unidadeService, 'getUnidadeExterna').and.returnValue(of([]));
    spyOn(unidadeService, 'getUnidade').and.returnValue(
      of([
        {
          descRamais: 'Ramal 101',
          nomeUnidade: 'Departamento de Tecnologia',
          seqUnidade: 2,
          sgUnidade: 'TESTE',
        },
      ])
    );
    spyOn(guard, 'handleException').and.callThrough();
    spyOn(alertUtil, 'okModalDialog').and.returnValue(Promise.resolve(false));
    const result = await guard.canActivate();
    const expected = result ? true : false;
    expect(expected).toBe(false);
    expect(guard.handleException).toHaveBeenCalled();
  });

  // Cenário 3: Permitir a navegação quando o usuário não está autenticado
  it('deve permitir a navegação quando o usuário não está autenticado', async () => {
    spyOn(authService, 'isLoggedLoginUnico').and.returnValue(false);

    const result = await guard.canActivate();

    expect(result).toBe(true);
  });

  it('deve testar handleException dadosUnidadeExterna null', async () => {
    spyOn(alertUtil, 'okModalDialog').and.returnValue(Promise.resolve(true));
    guard.handleException();

    expect(alertUtil.okModalDialog).toHaveBeenCalled();
  });
});

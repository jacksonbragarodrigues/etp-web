import { TestBed } from '@angular/core/testing';

import {
  AlertDialogService,
  ConfirmationDialogService,
  NotificacaoService,
} from '@administrativo/components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AlertUtils } from './alerts.util';

describe('AlertUtils', () => {
  let service: AlertUtils;
  let confirmationDialogService: ConfirmationDialogService;
  let alertDialogService: AlertDialogService;
  let notificacaoService: NotificacaoService;
  let router: Router;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [
        AlertUtils,
        ConfirmationDialogService,
        NotificacaoService,
        AlertDialogService,
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigateByUrl']),
        },
      ],
    });
    service = TestBed.inject(AlertUtils);
    confirmationDialogService = TestBed.inject(ConfirmationDialogService);
    alertDialogService = TestBed.inject(AlertDialogService);
    notificacaoService = TestBed.inject(NotificacaoService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deve testar alertDialog', () => {
    const message = 'Test message';

    spyOn(alertDialogService, 'open').and.returnValue(Promise.resolve(true));

    service.alertDialog(message);

    expect(alertDialogService.open).toHaveBeenCalled();
  });

  it('Deve testar okModalDialog', () => {
    const message = 'Test message';

    spyOn(alertDialogService, 'open').and.returnValue(Promise.resolve(true));

    service.okModalDialog(message);

    expect(alertDialogService.open).toHaveBeenCalled();
  });

  it('Deve testar confirmDialog', () => {
    const message = 'Test message';

    spyOn(confirmationDialogService, 'confirm').and.returnValue(
      Promise.resolve(true)
    );

    service.confirmDialog(message);

    expect(confirmationDialogService.confirm).toHaveBeenCalled();
  });

  it('Deve testar handleAccessDenied', () => {
    const message = 'Test message';

    spyOn(alertDialogService, 'open').and.returnValue(Promise.resolve(true));

    service.handleAccessDenied(message);

    expect(alertDialogService.open).toHaveBeenCalled();
  });

  it('Deve testar handleSucess', () => {
    const message = 'Test message';

    spyOn(notificacaoService, 'notify');

    service.handleSucess(message);

    expect(notificacaoService.notify).toHaveBeenCalled();
  });

  it('Deve testar handleError status 404', () => {
    const message = {
      error: {
        status: 404,
        detail: 'Test message',
      },
    };
    spyOn(service, 'alertDialog');

    service.handleError(message);

    expect(service.alertDialog).toHaveBeenCalled();
  });

  it('Deve testar handleError status 400', () => {
    const message = {
      error: {
        status: 400,
        detail: 'Test message',
        fieldErrors: [
          {
            fieldError: 'Test field error',
          },
        ],
      },
    };

    spyOn(service, 'alertDialog');

    service.handleError(message);

    expect(service.alertDialog).toHaveBeenCalled();
  });

  it('Deve testar handleError status 400 else', () => {
    const message = {
      error: {
        status: 400,
        detail: 'Test message',
      },
    };

    spyOn(service, 'alertDialog');

    service.handleError(message);

    expect(service.alertDialog).toHaveBeenCalled();
  });

  it('Deve testar handleError status 403', () => {
    const message = {
      error: {
        status: 403,
        detail: 'Test message',
      },
    };

    service.handleError(message);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/acesso-negado');
  });

  it('Deve testar handleError status 401', () => {
    const message = {
      error: {
        status: 401,
        detail: 'Test message',
      },
    };

    spyOn(notificacaoService, 'notify');

    service.handleError(message);

    expect(notificacaoService.notify).toHaveBeenCalled();
  });

  it('Deve testar handleErrorSarh', () => {
    spyOn(notificacaoService, 'notify');

    service.handleErrorSarh();

    expect(notificacaoService.notify).toHaveBeenCalled();
  });

  it('Deve testar handleErrorCustomValidation', () => {
    const message = 'Test message';
    spyOn(notificacaoService, 'notify');

    service.handleErrorCustomValidation(message);

    expect(notificacaoService.notify).toHaveBeenCalled();
  });

  it('Deve testar toastrWarningMsg', () => {
    const message = 'Test message';
    spyOn(notificacaoService, 'notify');

    service.toastrWarningMsg(message);

    expect(notificacaoService.notify).toHaveBeenCalled();
  });
});

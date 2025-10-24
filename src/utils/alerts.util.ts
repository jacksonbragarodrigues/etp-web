import {
  AlertDialogService,
  ConfirmationDialogService,
  NotificacaoService,
} from '@administrativo/components';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AlertUtils {
  constructor(
    public notificacaoService: NotificacaoService,
    public alertDialogService: AlertDialogService,
    private confirmationDialogService: ConfirmationDialogService,
    private router: Router
  ) {}

  alertDialog(message: any) {
    this.alertDialogService
      .open(
        'Atenção',
        `
    <div class="center"> ${message} </div>
    `,
        'fas fa-exclamation-triangle',
        {
          verticalAlign: true,
          iconColor: '#F9C112',
          dialogSize: 'md',
          showCloseIcon: false,
        }
      )
      .then((confirmed: any) => {});
  }

  /**O evento é esecutado apóes o click ex => this.alertUtils.okModalDialog('msg).then((confirmed: any) => { seu evento })*/
  okModalDialog(message: any) {
    return this.alertDialogService.open(
      'Atenção',
      `<div class="center"> ${message} </div>`,
      'fas fa-exclamation-triangle',
      {
        dialogSize: 'md',
        verticalAlign: true,
        iconColor: '#F9C112',
        showCloseIcon: false,
      }
    );
  }

  async confirmDialog(message: any) {
    return await this.confirmationDialogService.confirm(
      'Atenção',
      `${message}`,
      {
        icon: 'fa-question-circle',
        verticalAlign: true,
        iconColor: '#F9C112',
        showCloseIcon: false,
      }
    );
  }

  handleAccessDenied(message: any) {
    this.alertDialogService
      .open('Acesso Negado!', message, 'fa fa-window-close', {
        dialogSize: 'md',
        iconColor: '#b2101d',
        verticalAlign: false,
        showCloseIcon: false,
      })
      .then(() => {});
  }

  handleSucess(message: any) {
    this.toastrSuccessMsg(message);
  }

  handleError(error: any) {
    if (error.error.status === 400) {
      if (error.error.fieldErrors) {
        const errors: any = [];
        error.error.fieldErrors.forEach((element: any) => {
          errors.push(element.fieldError);
        });
        this.alertDialog(errors);
      } else {
        this.alertDialog(error.error.detail);
      }
    } else if (error.error.status === 422 || error.error.status === 404) {
      this.alertDialog(error.error.detail);
    } else {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        // client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // server-side error
        errorMessage = `
        Error Code: ${error.error.status || error.status}
        Message: ${error.error.detail}`;
      }

      if (error.error.status === 403) {
        this.router.navigateByUrl('/acesso-negado');
      } else {
        this.notificacaoService.notify('error', 'Erro', errorMessage, 5000);
      }
    }
  }

  handleErrorSarh() {
    let errorMessage = '';
    errorMessage = `Message: Erro ao tentar acessar, tente novamente.`;
    this.notificacaoService.notify('error', 'Erro', errorMessage, 5000);
  }

  handleErrorCustom(error: any) {
    let errorMessage = '';
    errorMessage = `
      ${error.error.status}
      Message: Erro ao tentar acessar, contate o administrador`;
    this.notificacaoService.notify('error', 'Erro', errorMessage, 5000);
  }

  handleErrorCustomValidation(msg: any) {
    this.notificacaoService.notify('error', 'Erro', msg, 5000);
  }

  toastrErrorMsg(erro: any) {
    if (erro?.status == 422) {
      this.alertDialog(erro?.error?.detail);
    } else if (erro?.status != 403) {
      this.notificacaoService.notify(
        'error',
        'Erro!',
        erro?.error?.detail,
        2500
      );
    }
  }

  toastrSuccessMsg(message: any) {
    this.notificacaoService.notify('success', 'Sucesso', message, 2500);
  }

  toastrWarningMsg(message: string) {
    this.notificacaoService.notify('warn', 'Atenção!', message, 2500);
  }

  isEmpty(dado: any) {
    return (
      dado === undefined || dado === '' || dado === null || dado.length == 0
    );
  }
}

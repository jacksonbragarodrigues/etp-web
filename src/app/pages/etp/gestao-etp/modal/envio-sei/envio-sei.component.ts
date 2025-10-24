import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthLoginGuard } from 'src/app/auth/auth-login.guard';
import { EtapasEnum } from 'src/app/enums/etapas.enum';
import { EtpEnvioSeiService } from 'src/app/services/etp-envio-sei.service';
import { EtpSeiService } from 'src/app/services/etp-sei.service';
import { FormularioSeiService } from 'src/app/services/formulario-sei.service';
import { GestaoEtpAnaliseService } from 'src/app/services/gestao-etp-analise.service';
import { AlertUtils } from 'src/utils/alerts.util';

@Component({
  selector: 'app-envio-sei',
  templateUrl: './envio-sei.component.html',
  styleUrl: './envio-sei.component.scss',
})
export class EnvioSeiComponent implements OnInit {
  @ViewChild('enviarSeiModal') private modalContent:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @ViewChild('registrarSeiModal') private modalContentRegistrar:
    | TemplateRef<EnvioSeiComponent>
    | undefined;
  modalRefRegistrar!: NgbModalRef;
  listaEnvios: any[] = [];
  @Input()
  reloadPublicarEtp?: Function;
  @Input()
  id!: number;
  @Input()
  situacao!: any;
  @Input()
  tipo!: 'ETP' | 'ETP_ANALISE' | 'FORMULARIO';
  @Input()
  etp?: any;
  documento: any;
  hasUnlockSEIPermission = false;

  constructor(
    private alertUtils: AlertUtils,
    private etpSeiService: EtpSeiService,
    private formularioSeiService: FormularioSeiService,
    private etpEnvioSeiService: EtpEnvioSeiService,
    private authLoginGuard: AuthLoginGuard,
    public modalService: NgbModal,
    private gestaoEtpAnaliseService: GestaoEtpAnaliseService
  ) {}
  ngOnInit(): void {
    this.hasUnlockSEIPermission = this.authLoginGuard.hasPermission([
      'ENVIO_SEI_ABERTO;F',
    ]);
    if (!this.hasUnlockSEIPermission) {
      this.hasUnlockSEIPermission = this.authLoginGuard.hasPermission([
        'ENVIO_SEI_ABERTO;R',
      ]);
    }
    this.carregaEnvios();
  }

  temEtp() {
    return this.etp ? true : false;
  }

  statusSituacao() {
    return this.situacao?.chave === 'FECHADO' ||
    this.situacao?.chave === 'PUBLICADO' ||
    this.situacao?.chave === 'MINUTA'
      ? true
      : false;
  }

  carregaEnvios() {
    if (this.id != null) {
      this.etpSeiService
        .getListaEtpSeiPorEtp(this.id)
        .subscribe((response) => {
          this.listaEnvios = response;
        });
    }
  }

  public open(): Promise<boolean> {
    this.carregaEnvios();
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static', // Não fechar ao clicar fora
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-largura-customizada',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  public openRegistrar(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRefRegistrar = this.modalService.open(
        this.modalContentRegistrar,
        {
          centered: true,
          backdrop: 'static', // Não fechar ao clicar fora
          keyboard: false,
          fullscreen: false,
          windowClass: 'modal-largura-customizada-registrar',
        }
      );
      this.modalRefRegistrar.result.then((result) => {
        resolve(result);
      });
    });
  }

  // getDescricao() {
  //   return this.tipo === 'ETP' ? 'ETP' : 'Formulário';
  // }

  enviarSei(desbloqueado: boolean = false, ehAnalise: boolean = false) {
    let msg = `
    Deseja realmente enviar o ETP para o SEI?
    `;
    let reenviar = false;
    if (this.listaEnvios.length > 0) {
      const temFormal = this.listaEnvios.find((item) => item.situacao === 0 && item.tipoDocumento === 0);
      if (temFormal) {
        this.alertUtils.toastrWarningMsg(
          'Esse ETP já foi enviado para o SEI, para reenviar, crie uma nova versão do ETP ou cancele ou exclua os envios anteriores.'
        );
        return;
      }
      msg = `
    Esse ETP já foi enviado para o SEI. Deseja realmente reenviar ?
    `;
      reenviar = true;
    }

    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        let dadosEnvioSei = {
          reenviar: reenviar,
          id: this.id,
          desbloqueado: desbloqueado,
          ehAnalise: ehAnalise,
        };
        this.enviarEtpSei(dadosEnvioSei);
      }
    });
  }

  enviarTermoSei(desbloqueado: boolean = false, ehAnalise: boolean = false) {
    let msg = `
    Deseja realmente enviar o Termo de Orientação para o SEI?
    `;
    if (this.listaEnvios.length > 0) {
      const temFormal = this.listaEnvios.find((item) => item.situacao === 0 && item.tipoDocumento === 1);
      if (temFormal) {
        this.alertUtils.toastrWarningMsg(
          'Esse Termo de Orientação já foi enviado para o SEI, para reenviar, cancele ou exclua os envios anteriores.'
        );
        return;
      }
    }

    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        let dadosEnvioSei = {
          reenviar: false,
          id: this.id,
          desbloqueado: desbloqueado,
          ehAnalise: ehAnalise,
        };
        dadosEnvioSei = { ...dadosEnvioSei, ehAnalise: true };
        this.enviarEtpSei(dadosEnvioSei);
      }
    });
  }

  enviarAnalise() {
    if (this.listaEnvios.length > 0) {
      const temFormal = this.listaEnvios.find((item) => item.situacao === 0 && item.tipoDocumento === 0);
      if (!temFormal) {
        this.alertUtils.toastrWarningMsg(
          'Esse ETP não foi enviado para o SEI, para enviar para Análise é obrigatório o envio para o SEI.'
        );
        return;
      }
    } else {
      this.alertUtils.toastrWarningMsg(
        'Esse ETP não foi enviado para o SEI, para enviar para Análise é obrigatório o envio para o SEI.'
      );
      return;
    }
    let dadosEnvioSei = {
      id: this.id,
    };

    this.trocarEtapaEtp(dadosEnvioSei, 'AGUARDANDO_ANALISE');
  }

  retornarAnalise() {
    if (this.listaEnvios.length > 0) {
      const temFormal = this.listaEnvios.find((item) => item.situacao === 0 && item.tipoDocumento === 1);
      if (!temFormal) {
        this.alertUtils.toastrWarningMsg(
          'Esse Termo de Orientação não foi enviado para o SEI, para retornar para o Gestor é obrigatório o envio para o SEI.'
        );
        return;
      }
    }
    let dadosEnvioSei = {
      id: this.id,
    };
    this.trocarEtapaEtp(dadosEnvioSei, 'ANALISADO');
  }

  enviarEtpSei(dadosEnvioSei: any) {
    this.etpEnvioSeiService.enviarSei(dadosEnvioSei).subscribe({
      next: () => {
        this.alertUtils.handleSucess(`Documento enviado com sucesso para o SEI`);
        if (this.reloadPublicarEtp) {
          this.reloadPublicarEtp();
        }
        this.close();
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  trocarEtapaEtp(obj: any, acao: any) {
    const id = obj?.id;
    const objFormulario = Object.keys(EtapasEnum).find((key) => key === acao);
    const textoEtapa = EtapasEnum[acao as keyof typeof EtapasEnum];
    let msg = `
      Deseja ${textoEtapa} ?
      `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gestaoEtpAnaliseService
          .alteraEtpEtapaAnalise(id, objFormulario)
          .subscribe({
            next: (etp: any) => {
              this.alertUtils.handleSucess(
                `Ação ` + textoEtapa + ` executada com sucesso`
              );
              if (this.reloadPublicarEtp) {
                this.reloadPublicarEtp();
              }
              this.close();
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  enviarFormularioSei(dadosEnvioSei: any) {
    this.etpEnvioSeiService.enviarFormularioSei(dadosEnvioSei).subscribe({
      next: () => {
        this.alertUtils.handleSucess(
          `Formulário enviado com sucesso para o SEI`
        );
        this.carregaEnvios();
      },
      error: (e: any) => {
        this.alertUtils.toastrErrorMsg(e);
      },
    });
  }

  getSituacao(situacao: any) {
    switch (situacao) {
      case 0:
        return 'Normal';
      case 1:
        return 'Cancelado';
      case 2:
        return 'Excluído';
      default:
        return '';
    }
  }

  getTipoDocumento(tipoDocumento: any) {
    switch (tipoDocumento) {
      case 0:
        return 'ETP';
      case 1:
        return 'Termo de Orientação';
      case 2:
        return 'NExcluído';
      default:
        return '';
    }
  }

  updateEtpSei(idEtpSei: any, situacao: any) {
    const descricaoSituacao = situacao === 1 ? 'Cancelar' : 'Excluir';
    let msg = `
    Deseja ${descricaoSituacao} esse envio?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        const dadosEnvioSei = {
          idEtpSei: idEtpSei,
          situacao: situacao,
        };
        this.etpEnvioSeiService.updateEtpSei(dadosEnvioSei).subscribe({
          next: (documentoResposta: any) => {
            if (documentoResposta) {
              this.alertUtils.handleSucess(`Evnio SEI atualizado com sucesso`);
            } else {
              this.alertUtils.toastrWarningMsg(
                'Erro ao tentar atualizar o envio'
              );
            }

            this.carregaEnvios();
          },
          error: (e: any) => {
            this.alertUtils.toastrErrorMsg(e);
          },
        });
      }
    });
  }

  registrarEnvioseiEtp() {
    let msg = `
    Deseja registrar um documento que foi inserido no sistema SEI?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        const dsdosDocumento = {
          procedimento: this.documento,
          idEtp: this.id,
        };
        this.etpEnvioSeiService
          .consultarECriarDocumentoSei(dsdosDocumento)
          .subscribe({
            next: (documentoResposta: any) => {
              if (documentoResposta) {
                this.alertUtils.handleSucess(
                  `Documento registrado com sucesso no ETP`
                );
              } else {
                this.alertUtils.toastrWarningMsg(
                  'Erro ao registrar o documento'
                );
              }

              this.carregaEnvios();
              this.closeRegistrar();
            },
            error: (e: any) => {
              this.alertUtils.toastrErrorMsg(e);
            },
          });
      }
    });
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  closeRegistrar() {
    if (this.documento) {
      this.documento = undefined;
    }
    if (this.modalRefRegistrar) {
      this.modalRefRegistrar.dismiss();
    }
  }

  podeEnviarAnalise() {
    if (
      this.etp.item.etpEtapa.chave != 'AGUARDANDO_ANALISE' &&
      this.etp.item.etpEtapa.chave != 'AGUARDANDO_REVISAO' &&
      this.etp.item.etpEtapa.chave != 'AGUARDANDO_RETORNO_ANALISE' &&
      this.etp.item.etpEtapa.chave != 'ANALISADO'
    ) {
      return true;
    }
    return false;
  }

  podeRetornarAnalise() {
    if (this.etp.item.etpEtapa.chave == 'AGUARDANDO_RETORNO_ANALISE') {
      return true;
    }
    return false;
  }

  isEtapaAnalise() {
    if (
      this.etp.item.etpEtapa.chave === 'AGUARDANDO_ANALISE' ||
      this.etp.item.etpEtapa.chave === 'AGUARDANDO_REVISAO' ||
      this.etp.item.etpEtapa.chave === 'AGUARDANDO_RETORNO_ANALISE' ||
      this.etp.item.etpEtapa.chave === 'ANALISADO'
    ) {
      return true;
    }
    return false;
  }

}

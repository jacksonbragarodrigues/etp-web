import { SeiService } from './../../../../../services/sei.service';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EtpNumeracaoService } from '../../../../../services/etp-numeracao.service';
import GestaoBase from 'src/app/pages/shared/gestao-base';
import { AlertUtils } from 'src/utils/alerts.util';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'cadastrar-etp',
  templateUrl: './cadastrar-etp.component.html',
  styleUrl: './cadastrar-etp.component.scss',
})
export class CadastrarEtpComponent {
  @ViewChild('cadastrarEtpComponent', { static: true }) private modalContent:
    | TemplateRef<CadastrarEtpComponent>
    | undefined;
  modalRef!: NgbModalRef;
  @Input()
  estaAberto?: boolean = true;

  @Output() cadastrarEtp = new EventEmitter();
  gestaoBase: GestaoBase = new GestaoBase();
  situacaoList: any[] = [];
  formularioList: any[] = [];
  tipoLicitacaoList: any[] = [];
  unidadeList: any[] = [];
  unidadeListFiltrada: any[] = [];
  etapaList: any[] = [];
  etp: any;
  unidadeEtp!: any;
  public gestaoEtpModalForm!: FormGroup;
  public titulo?: string = 'Elaborar ETP';
  itemSelecionado: boolean = false;

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private etpNumeracaoService: EtpNumeracaoService,
    private seiService: SeiService,
    private alertUtils: AlertUtils
  ) {}

  open(
    etp: any,
    formularioList: any[],
    tipoLicitacaoList: any[],
    situacaoList: any[],
    etapaList: any[],
    unidadeList: any[],
    unidadeUsarioLogado: any
  ): Promise<boolean> {
    this.situacaoList = situacaoList;
    this.formularioList = formularioList;
    this.tipoLicitacaoList = tipoLicitacaoList;
    this.etapaList = etapaList;

    if (etp?.propriedade) {
      this.titulo = etp.propriedade;
    }
    if (!etp) {
      etp = {};
      etp.situacao = situacaoList.find((s) => s.chave === 'ABERTO');
      etp.etpEtapa = etapaList.find((s) => s.descricao === 'INICIAL');
    }
    this.etp = etp;

    let processoSei = '';
    if (etp.numeroProcessoSei) {
      processoSei = etp?.numeroProcessoSei + '/' + etp?.anoProcessoSei;
    }
    const anoAtual = new Date().getFullYear();
    this.gestaoEtpModalForm = this.formBuilder.group({
      formularioId: [etp?.formulario?.id, [Validators.required]],
      tipoLicitacaoId: [etp?.tipoLicitacao?.id, [Validators.required]],
      situacaoId: [etp?.situacao?.id, [Validators.required]],
      etapaId: [etp?.etpEtapa?.id, [Validators.required]],
      descricao: [etp?.descricao, [Validators.required]],
      etpPai: etp?.etpPai,
      versao: etp.versao ? etp?.versao : 1,
      ano: [etp?.ano || anoAtual],
      etpNumeracao: [{ value: etp?.etpNumeracao, disabled: true }],
      unidadeEtp: [{ value: null, disabled: true }, [Validators.required]],
      unidadeUsarioLogado: [
        { value: null, disabled: true },
        [Validators.required],
      ],
      processoSei: processoSei,
    });

    this.gestaoEtpModalForm?.get('etapaId')?.disable();

    if (this.etp?.id && this.etp?.formulario) {
      const temFormulario = this.formularioList.find(
        (f) => f.id === this.etp.formulario.id
      );
      if (!temFormulario) {
        this.formularioList.push(this.etp.formulario);
      }
    }

    if (unidadeList.length === 0) {
      this.unidadeEtp = unidadeUsarioLogado;
      this.unidadeList = [this.unidadeEtp];
      this.gestaoEtpModalForm
        ?.get('unidadeUsarioLogado')
        ?.setValue(this.unidadeEtp.id);
    } else {
      this.unidadeList = unidadeList;
      this.unidadeEtp = this.unidadeList.filter(
        (u) => u.id === etp.unidadeId
      )[0];
      this.gestaoEtpModalForm?.get('unidadeEtp')?.setValue(this.unidadeEtp.id);
      this.gestaoEtpModalForm?.get('unidadeEtp')?.enable();
    }

    if (this.unidadeEtp) {
      this.unidadeEtp = {
        ...this.unidadeEtp,
        descricaoSigla: `${this.unidadeEtp.sigla} - ${this.unidadeEtp.descricao}`,
      };
    }

    if (this.unidadeList?.length > 0) {
      this.unidadeList = this.unidadeList.map((unidade) => {
        unidade = {
          ...unidade,
          descricaoSigla: `${unidade.sigla} - ${unidade.descricao}`,
        };
        return unidade;
      });
    }

    this.gestaoEtpModalForm?.get('situacaoId')?.disable();

    if (!this.estaAberto) {
      this.gestaoEtpModalForm.get('tipoLicitacaoId')?.disable();
      this.gestaoEtpModalForm.get('descricao')?.disable();
      this.gestaoEtpModalForm.get('situacaoId')?.disable();
      this.gestaoEtpModalForm.get('formularioId')?.disable();
      this.gestaoEtpModalForm.get('etapaId')?.disable();
      this.gestaoEtpModalForm.get('processoSei')?.disable();
      this.gestaoEtpModalForm.get('unidadeEtp')?.disable();
      this.gestaoEtpModalForm.get('unidadeUsarioLogado')?.disable();
    }

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal-largura-customizada',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  completaProcessoSeiNumeroEtp(event: any, seiEtp: string) {
    const inputValue = event.target.value;
    let seiEtpEdit = undefined;
    if (inputValue) {
      if (inputValue.includes('/')) {
        const eventSplit = inputValue.split('/');
        seiEtpEdit =
          eventSplit[0].padStart(6, '0') +
          '/' +
          (!eventSplit[1] ? '2024' : eventSplit[1]);
      } else {
        seiEtpEdit = inputValue.padStart(6, '0') + '/' + '2024';
      }
      this.formControl[seiEtp]?.setValue(seiEtpEdit);
    }
  }

  async gravar() {
    const objEtp = await this.gerarObjEtp();
    this.cadastrarEtp.emit(objEtp);
  }

  async gerarObjEtp() {
    if (!this.etp?.id) {
      await this.recuperarNumeroEtp();
    }
    const objEtp = {
      id: this.etp?.id,
      formulario: {
        id: this.formControl['formularioId']?.value,
        descricao: null,
      },
      tipoLicitacao: {
        id: this.formControl['tipoLicitacaoId']?.value,
        descricao: null,
      },
      situacao: {
        id: this.formControl['situacaoId']?.value,
        descricao: null,
      },
      descricao: this.formControl['descricao']?.value,
      ano: this.formControl['ano']?.value,
      etpNumeracao: this.formControl['etpNumeracao']?.value,
      versao: this.formControl['versao']?.value,
      processoSei: this.formControl['processoSei']?.value,
      etapa: this.formControl['etapaId']?.value,
      etpPai: this.formControl['etpPai']?.value,
      unidadeId: this.etp?.id
        ? this.formControl['unidadeEtp']?.value.id
        : this.formControl['unidadeUsarioLogado']?.value,
    };
    return objEtp;
  }

  async close(fecharModal = false) {
    if (this.modalRef) {
      if (fecharModal) {
        this.modalRef.close();
        return;
      }
      const objEtp = await this.gerarObjEtp();

      if (this.etp?.propriedade && !this.compararEtps(this.etp, objEtp)) {
        const msg = `Há dados não salvos. Deseja gravá-los?`;
        this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
          if (dataConfirme) {
            this.gravar();
            this.modalRef.close();
          } else {
            this.modalRef.close();
          }
        });
      } else {
        this.modalRef.close();
      }
    }
  }

  compararEtps(etp: any, etpObj: any) {
    let isValidProcessosei = true;
    if (etpObj?.processoSei && etp?.anoProcessoSei && etp?.numeroProcessoSei) {
      const processoSeiSplit = etpObj?.processoSei.split('/');
      isValidProcessosei =
        processoSeiSplit[0] == etp?.numeroProcessoSei &&
        processoSeiSplit[1] == etp?.anoProcessoSei;
    }
    const validarComparacao =
      isValidProcessosei &&
      etp.id == etpObj.id &&
      etp.formulario.id == etpObj.formulario.id &&
      etp.tipoLicitacao.id == etpObj.tipoLicitacao.id &&
      etp.situacao.id == etpObj.situacao.id &&
      etp.descricao === etpObj.descricao &&
      etp.ano === etpObj.ano &&
      etp.etpNumeracao === etpObj.etpNumeracao &&
      etp.etpEtapa.id == etpObj.etapa;
    return validarComparacao;
  }

  get formControl() {
    return this.gestaoEtpModalForm.controls;
  }

  async recuperarNumeroEtp() {
    if (
      this.formControl['ano']?.value &&
      String(this.formControl['ano']?.value).length >= 4
    ) {
      const data = await firstValueFrom(
        this.etpNumeracaoService.getUltimoNumeroEtpPorAno(
          Number(this.formControl['ano']?.value)
        )
      );
      this.formControl['etpNumeracao']?.setValue(String(data).padStart(4, '0'));
    }
  }

  setCurrentYear() {
    if (!this.formControl['ano']?.value) {
      const currentYear = new Date().getFullYear();
      this.formControl['ano']?.setValue(String(currentYear));
    }
  }

  public async pesquisaProcesso() {
    const processoSei = this.formControl['processoSei']?.value;
    await this.seiService.pesquisaProcesso(processoSei).then((data) => {
      this.formControl['processoSei'].setValue(data?.procedimentoFormatado);
      if (!data?.procedimentoFormatado) {
        this.alertUtils.alertDialog(
          `O número do processo SEI ${processoSei} não existe!`
        );
      }
    });
  }

  public buscarUnidades(event: any) {
    const query = event.query;
    this.unidadeListFiltrada = this.unidadeList.filter((u) =>
      u.descricaoSigla.toLowerCase().includes(query.toLowerCase())
    );
  }

  onCampoFocado() {
    setTimeout(() => {
      if (!this.itemSelecionado) {
        this.formControl['unidadeEtp'].setValue('');
      }
      this.itemSelecionado = false;
    }, 200);
  }

  onItemSelecionado() {
    this.itemSelecionado = true; // Marca que um item foi escolhido
  }
}

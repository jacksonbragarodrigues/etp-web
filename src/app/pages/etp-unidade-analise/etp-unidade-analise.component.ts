import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'etp-unidade-analise',
  templateUrl: './etp-unidade-analise.component.html',
  styleUrl: './etp-unidade-analise.component.scss',
})
export class EtpUnidadeAnaliseComponent {
  @ViewChild('etpUnidadeAnalise', { static: true }) private modalContent:
    | TemplateRef<EtpUnidadeAnaliseComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @Output() enviarUnidadeAnalise = new EventEmitter();
  public unidadeAnaliseForm!: FormGroup;

  public titulo?: string = 'Incluir Unidade de Análise';

  etapasList: any[] = [];
  unidadesList: any[] = [];
  unidadeListFiltrada: any[] = [];

  unidadeId!: any;

  etpUnidadeAnalise: any;

  padraoList: any[] = [
    { id: 0, descricao: 'Não' },
    { id: 1, descricao: 'Sim' },
  ];

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  open(unidadeAnalise: any, etapaList: any, unidadeList: any) {
    this.etpUnidadeAnalise = unidadeAnalise;
    if (this.etpUnidadeAnalise?.id) {
      this.titulo = 'Alterar Unidade de Análise';
    } else {
      this.titulo = 'Incluir Unidade de Análise';
    }

    const unidades = unidadeList.map((unidade: any) => {
      return {
        ...unidade,
        descricaoSigla: `${unidade.sigla} - ${unidade.descricao}`,
      };
    });
    this.unidadesList = unidades;
    this.etapasList = etapaList;

    const etapa = this.etapasList.filter(
      (u) => u.id === unidadeAnalise?.idEtapa
    )[0];
    const unidade = this.unidadesList.filter(
      (u) => u.id === unidadeAnalise?.sqIdUnidade
    )[0];
    this.unidadeAnaliseForm = this.formBuilder.group({
      descricao: [unidadeAnalise?.dsUnidade, [Validators.required]],
      etapaId: [etapa?.id, [Validators.required]],
      unidadeId: [unidade, [Validators.required]],
      padrao: [unidadeAnalise?.padrao, [Validators.required]],
    });

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        fullscreen: false,
        windowClass: 'modal-largura-servidores',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  enviarUnidadeAnaliseSelecionada() {
    const analistaSelecionado = {
      descricao: this.formControl['descricao'].value,
      unidadeAnaliseId: this.etpUnidadeAnalise?.id,
      unidade: this.formControl['unidadeId'].value,
      etapa: this.formControl['etapaId'].value,
      padrao: this.formControl['padrao'].value,
    };

    this.enviarUnidadeAnalise.emit(analistaSelecionado);
    this.close();
  }

  get formControl() {
    return this.unidadeAnaliseForm.controls;
  }

  close() {
    if (this.modalRef) {
      this.unidadeAnaliseForm.reset();
      this.modalRef.close();
    }
  }

  public buscarUnidades(event: any) {
    if (this.unidadesList?.length > 0) {
      this.unidadesList = this.unidadesList.map((unidade) => {
        unidade = {
          ...unidade,
          descricaoSigla: `${unidade.sigla} - ${unidade.descricao}`,
        };
        return unidade;
      });
    }
    const query = event.query;
    this.unidadeListFiltrada = this.unidadesList.filter((u) =>
      u.descricaoSigla.toLowerCase().includes(query.toLowerCase())
    );
  }
}

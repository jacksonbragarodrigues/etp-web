import { EtpPrazoService } from './../../../services/etp-prazo.service';
import {
  ITabsModel,
  MenuLateralService,
  Page,
} from '@administrativo/components';
import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';
import { EtpUnidadeAnaliseService } from 'src/app/services/etp-unidade-analise.service';
import { Sarhclientservice } from 'src/app/services/sarhclient.service';
import { AlertUtils } from 'src/utils/alerts.util';
import { BibliotecaUtils } from 'src/utils/biblioteca.utils';
import { EtpUnidadeAnaliseComponent } from '../../etp-unidade-analise/etp-unidade-analise.component';
import GestaoBase from '../../shared/gestao-base';
import { EtpPrazoComponent } from '../../etp-prazo/etp-prazo.component';
import { PrioridadeService } from 'src/app/services/prioridade.service';

@Component({
  selector: 'app-modal-cadastrar-etp-tipo-licitacao',
  templateUrl: './modal-cadastrar-etp-tipo-licitacao.component.html',
  styleUrl: './modal-cadastrar-etp-tipo-licitacao.component.scss',
})
export class ModalCadastrarEtpTipoLicitacaoComponent implements OnInit {
  @ViewChild('modalCadastrarEtpTipoLicitacaoComponent') private modalContent:
    | TemplateRef<ModalCadastrarEtpTipoLicitacaoComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChild('etpUnidadeAnalise', { static: true })
  ETP_UNIDADE_ANALISE!: EtpUnidadeAnaliseComponent;

  @ViewChild('etpPrazo', { static: true })
  ETP_PRAZO!: EtpPrazoComponent;

  page!: Page<any>;
  pagePrazo!: Page<any>;

  @Output() cadastrarEtpTipoLicitacao = new EventEmitter();

  public gestaoEtpTipoLicitacaoModalForm!: FormGroup;

  public titulo?: string;

  descricaoTipoContratacao = '';

  etapaList: any[] = [];
  unidadesList: any[] = [];
  prioridadesList: any[] = [];

  etpTipoLicitacao: any;
  gestaoBase: GestaoBase = new GestaoBase();

  private lazyLoading: boolean = true;

  tabsModel!: ITabsModel[];
  menuIndex = 0;
  menuIndexAnterior: number = 0;
  disabledMenuIndexList: number[] = [];

  constructor(
    public modalService: NgbModal,
    public alertUtil: AlertUtils,
    private formBuilder: FormBuilder,
    private etpEtapaService: EtpEtapaService,
    private prioridadeService: PrioridadeService,
    private sarhclientservice: Sarhclientservice,
    private biblioteca: BibliotecaUtils,
    private etpUnidadeAnaliseService: EtpUnidadeAnaliseService,
    private etpPrazoService: EtpPrazoService,
    private menuLateral: MenuLateralService
  ) {}

  ngOnInit(): void {
    this.tabsModel = [
      { icone: 'fa fa-fw fa-file', descricao: 'Geral' },
      { icone: 'fa fa-fw fa-shield', descricao: 'Unidades de Análise' },
      { icone: 'fa fa-fw fa-clock-o', descricao: 'Prazos' },
    ];

    this.menuLateral.disable(this.disabledMenuIndexList);

    this.menuLateral.onSelect.subscribe((index: any) => {
      this.menuIndex = index;
      this.menuIndexAnterior = index;
    });
  }

  open(etpTipoLicitacao: any): Promise<boolean> {
    this.initPage();
    this.initPagePrazo();
    this.etpTipoLicitacao = etpTipoLicitacao;
    this.gestaoEtpTipoLicitacaoModalForm = this.formBuilder.group({
      descricao: [etpTipoLicitacao?.descricao, [Validators.required]],
      chave: [etpTipoLicitacao?.chave, [Validators.required]],
    });

    if (this.etpTipoLicitacao?.id) {
      this.titulo = 'Alterar Tipo de Contratação';
      this.descricaoTipoContratacao = etpTipoLicitacao.descricao;
    } else {
      this.titulo = 'Cadastrar Tipo de Contratação';
      this.descricaoTipoContratacao = '';
      this.disabledMenuIndexList = [1, 2];
      this.menuLateral.disable(this.disabledMenuIndexList);
    }

    this.tableLazyLoading();
    this.tableLazyLoadingPrazo();
    this.getEtapas();
    this.getUnidades();
    this.getPrioridades();

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        size: 'xl',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  getEtapas() {
    this.etpEtapaService.getEtpEtapaLista().subscribe((etapaList) => {
      this.etapaList = etapaList;
    });
  }

  getPrioridades() {
    this.prioridadeService
      .getPrioridadeFormulario()
      .subscribe((prioridadeList) => {
        this.prioridadesList = prioridadeList;
      });
  }

  getUnidades() {
    this.sarhclientservice.getListaUnidades().subscribe((unidadesList) => {
      this.unidadesList = unidadesList;
    });
  }

  gravar() {
    const objEtpTipoLicitacao = {
      id: this.etpTipoLicitacao?.id,
      descricao: this.formControl['descricao']?.value,
      chave: this.formControl['chave']?.value,
    };
    this.cadastrarEtpTipoLicitacao.emit(objEtpTipoLicitacao);
  }

  close() {
    if (this.modalRef) {
      this.modalRef.dismiss();
    }
  }

  get formControl() {
    return this.gestaoEtpTipoLicitacaoModalForm.controls;
  }

  adicionarEtpUnidadeAnalise() {
    if (this.etpTipoLicitacao.id) {
      this.ETP_UNIDADE_ANALISE.open(null, this.etapaList, this.unidadesList);
    } else {
      this.alertUtil.handleError(
        `Salve o tipo de contratação para informar as unidades de análise.`
      );
    }
  }

  editarEtpUnidadeAnalise(unidadeAnalise: any) {
    this.ETP_UNIDADE_ANALISE.open(
      unidadeAnalise,
      this.etapaList,
      this.unidadesList
    );
  }

  excluirEtpUnidadeAnalise(unidadeAnalise: any) {
    this.alertUtil
      .confirmDialog('Deseja remover a unidade de análise?')
      .then((dataConfirme) => {
        if (dataConfirme) {
          this.etpUnidadeAnaliseService
            .deleteUnidadeAnalise(unidadeAnalise.id)
            .subscribe({
              next: (data: any) => {
                this.tableLazyLoading();
                this.alertUtil.handleSucess(
                  'Unidade de análise removida com sucesso!'
                );
              },
              error: (error: any) => {
                this.alertUtil.toastrErrorMsg(
                  'Houve um erro ao tentar excluir os dados.'
                );
              },
            });
        }
      });
  }

  tableLazyLoading(event?: any) {
    this.getPesquisarUnidadesAnalise(this.page, this.lazyLoading);
  }

  getPesquisarUnidadesAnalise(pageEvent?: any, lazyLoading: boolean = false) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      tipoLicitacao: this.etpTipoLicitacao?.id,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.etpUnidadeAnaliseService.getUnidadeAnalise(objParams).subscribe({
      next: (data: any) => {
        if (lazyLoading) {
          if (!this.page) {
            this.initPage();
          }
          this.page.content = data.content;
          this.page.totalElements = data.totalElements;
        } else {
          this.page = data;
        }
      },
      error: (e: any) => {
        this.alertUtil.handleError(e);
      },
    });
  }

  initPage() {
    this.page = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 5,
      sort: null,
      totalElements: 0,
      totalPages: 0,
    };
  }

  incluirUnidadeAnalise(event: any) {
    const unidadeAnalise = {
      dsUnidade: event.descricao,
      sqIdUnidade: event.unidade.id,
      tipoLicitacao: this.etpTipoLicitacao.id,
      etapa: event.etapa,
      padrao: event.padrao,
    };

    if (event.unidadeAnaliseId) {
      this.etpUnidadeAnaliseService
        .putUnidadeAnalise(event.unidadeAnaliseId, unidadeAnalise)
        .subscribe({
          next: () => {
            this.tableLazyLoading();
            this.alertUtil.handleSucess(`Alterado com sucesso`);
          },
          error: (e: any) => {
            this.alertUtil.toastrErrorMsg(e);
          },
        });
    } else {
      this.etpUnidadeAnaliseService
        .postUnidadeAnalise(unidadeAnalise)
        .subscribe({
          next: (data: any) => {
            this.tableLazyLoading();
            this.alertUtil.handleSucess(`Salvo com sucesso`);
          },
          error: (e: any) => {
            this.alertUtil.toastrErrorMsg(e);
          },
        });
    }
  }

  adicionarEtpPrazo() {
    if (this.etpTipoLicitacao.id) {
      this.ETP_PRAZO.open(null, this.etapaList, this.prioridadesList);
    } else {
      this.alertUtil.handleError(
        `Salve o tipo de contratação para informar o prazo.`
      );
    }
  }

  editarEtpPrazo(unidadeAnalise: any) {
    this.ETP_PRAZO.open(unidadeAnalise, this.etapaList, this.prioridadesList);
  }

  excluirEtpPrazo(prazo: any) {
    this.alertUtil
      .confirmDialog('Deseja remover o prazo?')
      .then((dataConfirme) => {
        if (dataConfirme) {
          this.etpPrazoService.deletePrazo(prazo.id).subscribe({
            next: (data: any) => {
              this.tableLazyLoadingPrazo();
              this.alertUtil.handleSucess('Prazo removido com sucesso!');
            },
            error: (error: any) => {
              this.alertUtil.toastrErrorMsg(
                'Houve um erro ao tentar excluir os dados.'
              );
            },
          });
        }
      });
  }

  tableLazyLoadingPrazo(event?: any) {
    this.getPesquisarPrazo(this.pagePrazo, this.lazyLoading);
  }

  getPesquisarPrazo(pageEvent?: any, lazyLoading: boolean = false) {
    const objParams = {
      page: pageEvent?.number ? pageEvent?.number - 1 : 0,
      size: pageEvent?.size ? pageEvent?.size : 10,
      sort: pageEvent?.sort ? pageEvent?.sort : '',
      tipoLicitacao: this.etpTipoLicitacao?.id,
    };
    this.biblioteca.removeKeysNullable(objParams);
    this.etpPrazoService.getPrazo(objParams).subscribe({
      next: (data: any) => {
        if (lazyLoading) {
          if (!this.pagePrazo) {
            this.initPagePrazo();
          }
          this.pagePrazo.content = data.content;
          this.pagePrazo.totalElements = data.totalElements;
        } else {
          this.pagePrazo = data;
        }
      },
      error: (e: any) => {
        this.alertUtil.handleError(e);
      },
    });
  }

  initPagePrazo() {
    this.pagePrazo = {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 5,
      sort: null,
      totalElements: 0,
      totalPages: 0,
    };
  }

  incluirPrazo(event: any) {
    const prazo = {
      prioridade: event.prioridade,
      etapa: event.etapa,
      motivacaoPrazo: event.motivacaoPrazo,
      tipoLicitacao: this.etpTipoLicitacao.id,
      qtdDiasLimiteRevisor: event.qtdDiasLimiteRevisor,
      qtdDiasLimiteAnalista: event.qtdDiasLimiteAnalista,
      indStRegistro: event.indStRegistro,
    };

    if (event.prazoId) {
      this.etpPrazoService.putPrazo(event.prazoId, prazo).subscribe({
        next: () => {
          this.tableLazyLoadingPrazo();
          this.alertUtil.handleSucess(`Alterado com sucesso`);
        },
        error: (e: any) => {
          this.alertUtil.toastrErrorMsg(e);
        },
      });
    } else {
      this.etpPrazoService.postPrazo(prazo).subscribe({
        next: (data: any) => {
          this.tableLazyLoadingPrazo();
          this.alertUtil.handleSucess(`Salvo com sucesso`);
        },
        error: (e: any) => {
          this.alertUtil.toastrErrorMsg(e);
        },
      });
    }
  }
}

import { Page } from '@administrativo/components';
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
import { firstValueFrom } from 'rxjs';
import { FichaAnaliseAnalistasService } from 'src/app/services/ficha-analise-analistas.service';
import { PrioridadeService } from 'src/app/services/prioridade.service';
import { AlertUtils } from '../../../../../utils/alerts.util';
import { BibliotecaUtils } from '../../../../../utils/biblioteca.utils';
import { EtpTipoPermissaoService } from '../../../../services/etp-tipo-permissao.service';
import { Sarhclientservice } from '../../../../services/sarhclient.service';
import { EtpPrazoService } from './../../../../services/etp-prazo.service';
import { EtpUnidadeAnaliseService } from './../../../../services/etp-unidade-analise.service';
import { SelecionarAnalistaComponent } from './selecionar-analista/selecionar-analista.component';

@Component({
  selector: 'ficha-analise',
  templateUrl: './ficha-analise.component.html',
  styleUrl: './ficha-analise.component.scss',
})
export class FichaAnaliseComponent {
  @ViewChild('fichaAnalise', { static: true }) private modalContent:
    | TemplateRef<FichaAnaliseComponent>
    | undefined;
  modalRef!: NgbModalRef;

  @ViewChild('selecionarAnalista', { static: true })
  SELECIONAR_ANALISTA!: SelecionarAnalistaComponent;

  @Output() gravarFichaAnalise = new EventEmitter();
  @Output() removeAnalistaFichaAnalise = new EventEmitter();
  public fichaAnaliseModalForm!: FormGroup;

  prioridadeList: any[] = [];
  etpPrazoList: any[] = [];

  permissaoList: any[] = [];

  etapaAnaliseList: any[] = [];
  situacaoAnaliseList: any[] = [];
  etp: any;
  idFichaAnalise: any;
  unidadeList: any[] = [];
  analistasList: any[] = [];

  unidadeRequisitante!: any;
  unidadeAnalise!: any;
  unidadeAnaliseSelecionada: any;
  unidadeAnaliseList: any[] = [];
  unidadeAnaliseListFilter: any[] = [];
  unidadeFichaAnalise: any;

  qtdDiasLimiteAnalista = 0;
  qtdDiasLimiteRevisor = 0;

  fichaAnalise: any;

  @Input() page!: Page<any>;

  public titulo?: string = 'Criar Ficha de Análise';

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private alertUtils: AlertUtils,
    private biblioteca: BibliotecaUtils,
    private sarhclientservice: Sarhclientservice,
    private tipoPermisaoService: EtpTipoPermissaoService,
    private fichaAnaliseAnalistasService: FichaAnaliseAnalistasService,
    private prioridadeService: PrioridadeService,
    private etpPrazoService: EtpPrazoService,
    private etpUnidadeAnaliseService: EtpUnidadeAnaliseService
  ) {}

  async open(
    etapaAnaliseList: any,
    situacaoAnaliseList: any,
    unidadeList: any,
    etp: any,
    fichaAnalise: any,
    analistas: any
  ) {
    this.initPage();
    this.getTipoPermisaoService();
    const unidades = unidadeList.map((unidade: any) => {
      return {
        ...unidade,
        descricaoSigla: `${unidade.sigla} - ${unidade.descricao}`,
      };
    });
    this.etapaAnaliseList = etapaAnaliseList;
    this.situacaoAnaliseList = situacaoAnaliseList;
    this.unidadeList = unidades;

    fichaAnalise = fichaAnalise ?? {};

    this.prioridadeList = await firstValueFrom(
      this.prioridadeService.getPrioridadeFormulario()
    );

    const unidadesAnaliseResultList: any = await firstValueFrom(
      this.etpUnidadeAnaliseService.getUnidadeAnalisePorTipoContratacao(
        etp.tipoLicitacao ? etp.tipoLicitacao.id : etp.tipoContratacaoId
      )
    );

    if (!unidadesAnaliseResultList || unidadesAnaliseResultList.length == 0) {
      this.alertUtils.toastrWarningMsg(
        'Não há unidades de análises cadastradas para o tipo de contratação do ETP.'
      );
    }

    const idsValidos = new Set(
      unidadesAnaliseResultList.map((u: { sqIdUnidade: any }) => u.sqIdUnidade)
    );

    this.unidadeAnaliseList = this.unidadeList.filter((u) =>
      idsValidos.has(u.id)
    );

    let unidadeAnalise = fichaAnalise?.idUnidade;
    this.unidadeFichaAnalise = fichaAnalise?.idUnidade;

    if (!fichaAnalise.id) {
      unidadeAnalise = unidadesAnaliseResultList.filter(
        (u: any) => u.padrao == 1
      )[0]?.sqIdUnidade;
      this.unidadeFichaAnalise = unidadeAnalise;
    }

    let prioridade = fichaAnalise?.prioridade;
    if (!prioridade) {
      prioridade = this.prioridadeList.filter((p) => p.padrao == 1)[0];
    } else {
      prioridade = this.prioridadeList.filter(
        (p) => p.chave == fichaAnalise?.prioridade
      )[0];
    }

    this.etpPrazoList = await firstValueFrom(
      this.etpPrazoService.getPrazoPorTipoContratacao(
        etp.tipoLicitacao ? etp.tipoLicitacao.id : etp.tipoContratacaoId
      )
    );

    if (!this.etpPrazoList || this.etpPrazoList.length == 0) {
      this.alertUtils.toastrWarningMsg(
        'Não há prazos cadastradas para o tipo de contratação do ETP.'
      );
    }

    this.etp = etp;
    this.onPrioridadeChange(prioridade);

    const dataHoje = fichaAnalise?.entradaUnidade;
    if (!dataHoje) {
      this.setaDatasFichaDeAnalise(fichaAnalise, null);
    }

    this.idFichaAnalise = fichaAnalise?.id;
    if (analistas.length > 0) {
      this.setAnalistasFichaAnalise(analistas);
    }

    this.unidadeRequisitante = this.unidadeList.filter(
      (u) => u.id === this.etp.unidadeId
    )[0];
    this.unidadeAnalise = this.unidadeList.filter(
      (u) => u.id === unidadeAnalise
    )[0];

    this.fichaAnaliseModalForm = this.formBuilder.group({
      tipoContratacao: [
        { value: etp.tipoContratacao, disabled: true },
        [Validators.required],
      ],
      descricao: [
        { value: etp.descricao, disabled: true },
        [Validators.required],
      ],
      numero: [{ value: etp.numeroEtp, disabled: true }, [Validators.required]],
      unidadeRequisitante: [
        {
          value:
            this.unidadeRequisitante.sigla +
            ' - ' +
            this.unidadeRequisitante.descricao,
          disabled: true,
        },
        [Validators.required],
      ],
      unidadeAnalise: [this.unidadeAnalise, [Validators.required]],
      etapa: [fichaAnalise?.etapa, [Validators.required]],
      situacao: [fichaAnalise?.situacao, [Validators.required]],
      prioridade: [prioridade.chave, [Validators.required]],
      dataEntrada: [
        { value: fichaAnalise?.entradaUnidade, disabled: true },
        [Validators.required],
      ],
      dataLimiteSaida: [
        { value: fichaAnalise?.limiteSaidaUnidade, disabled: true },
        [Validators.required],
      ],
      dataSaidaEfeitva: [
        { value: fichaAnalise?.saidaEfetiva, disabled: true },
        [Validators.required],
      ],
      dataLimiteAnalista: [fichaAnalise?.limiteAnalista, [Validators.required]],
      dataEntregaRevisor: [
        { value: fichaAnalise?.entregaRevisor, disabled: true },
        [Validators.required],
      ],
      dataLimiteRevisor: [fichaAnalise?.limiteRevisor, [Validators.required]],
    });

    this.fichaAnaliseModalForm
      .get('dataLimiteAnalista')
      ?.valueChanges.subscribe((novaData) => {
        this.qtdDiasLimiteAnalista = this.calculaDiferencaDias(
          fichaAnalise?.entradaUnidade,
          novaData
        );
        this.setaDatasFichaDeAnalise(fichaAnalise, this.fichaAnaliseModalForm);
      });

    this.fichaAnaliseModalForm
      .get('dataLimiteRevisor')
      ?.valueChanges.subscribe((novaData) => {
        this.qtdDiasLimiteRevisor = this.calculaDiferencaDias(
          fichaAnalise?.limiteAnalista,
          novaData
        );
        this.setaDatasFichaDeAnalise(fichaAnalise, this.fichaAnaliseModalForm);
      });

    this.fichaAnalise = fichaAnalise;

    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        windowClass: 'modal-largura-ficha',
      });
      this.modalRef.result.then((result) => {
        resolve(result);
      });
    });
  }

  tableLazyLoading(event: any) {
    if (this.etp.etpFichaAnaliseAnalistas.length !== 0) {
      this.page.content = this.analistasList;
    }
  }

  gravarFicha() {
    let msg = `
    Deseja salvar a ficha de análise?
    `;

    if (!this.unidadeAnalise) {
      this.alertUtils.toastrWarningMsg(
        'Favor informar a unidade dos analistas reponsáveis pela Análise !!!!!'
      );
      return;
    }

    const fichaAnalise = this.gerarFichaAnalise();
    if (fichaAnalise.analistas.length <= 0) {
      this.alertUtils.toastrWarningMsg(
        'Favor informar os analistas reponsáveis pela Análise !!!!!'
      );
      return;
    }

    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.gravarFichaAnalise.emit(fichaAnalise);
      }
    });
  }

  private gerarFichaAnalise() {
    const analistasParse = this.analistasList.map((a: any) => {
      console.log('Analista:', a);
      return {
        // ...a,
        idUnidade: a.idUnidade,
        tipoPermissao: a.tipoPermissao,
        codMatricula: a.codMatricula,
        nomeServidor: a.nome,
        emailServidor: a.login + '@stj.jus.br',
        idFichaAnalise: this.idFichaAnalise,
        dataInicial: a.dataInicial, //this.adicionarTime(a.dataInicial,'00:00:00'),
        dataFinal: a.dataFinal, //this.adicionarTime(a.dataFinal,'23:59:59')
      };
    });

    return {
      ficha: {
        id: this.idFichaAnalise,
        versao: 1,
        idUnidade: this.unidadeAnalise.id,
        situacao: Number(this.formControl['situacao'].value),
        etapa: Number(this.formControl['etapa'].value),
        tipoAnalise: 0,
        entradaUnidade: this.adicionarTime(
          this.formControl['dataEntrada'].value,
          '00:00:00'
        ),
        limiteSaidaUnidade: this.adicionarTime(
          this.formControl['dataLimiteSaida'].value,
          '23:59:59'
        ),
        limiteAnalista: this.adicionarTime(
          this.formControl['dataLimiteAnalista'].value,
          '23:59:59'
        ),
        limiteRevisor: this.adicionarTime(
          this.formControl['dataLimiteRevisor'].value,
          '23:59:59'
        ),
        idEtp: this.etp.id,
        prioridade: this.formControl['prioridade'].value, //verificar valor se esta desc ou cod
        tipoDocumento: 'F',
      },
      analistas: analistasParse,
    };
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }

  get formControl() {
    return this.fichaAnaliseModalForm.controls;
  }

  buscarUnidadesAnalise(event: any) {
    const query = event.query;
    this.unidadeAnaliseListFilter = this.unidadeAnaliseList.filter((unidade) =>
      unidade.descricaoSigla.toLowerCase().includes(query.toLowerCase())
    );
  }

  onUnidadeAnaliseSelecionada(unidade: any) {
    this.unidadeAnaliseSelecionada = unidade.value;
    this.unidadeFichaAnalise = unidade.value.id;
  }

  excluirAnalista(analista: any) {
    let msg = `
    Deseja remover o analista da ficha de análise?
    `;
    this.alertUtils.confirmDialog(msg).then((dataConfirme) => {
      if (dataConfirme) {
        this.analistasList = this.analistasList.filter(
          (item) =>
            !(
              item.idFichaAnalise === analista.idFichaAnalise &&
              item.tipoPermissao === analista.tipoPermissao &&
              item.codMatricula === analista.codMatricula
            )
        );
        this.page.content = this.analistasList;
        this.page.totalElements = this.analistasList.length;
        this.removerAnalistaFichaAnalise(analista);
      }
    });
  }

  removerAnalistaFichaAnalise(event: any) {
    this.fichaAnaliseAnalistasService
      .deleteFichaAnaliseAnalistas(event)
      .subscribe({
        next: () => {
          this.alertUtils.handleSucess(`Analista removido com sucesso`);
        },
        error: (e: any) => {
          this.alertUtils.toastrErrorMsg(e);
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

  adicionarAnalistas() {
    this.SELECIONAR_ANALISTA.open(
      this.unidadeFichaAnalise,
      this.analistasList,
      this.permissaoList
    );
  }

  incluirAnalista(event: any) {
    const checaInclusao = this.analistasList.some(
      (item) =>
        item.tipoPermissao === event.tipoPermissao &&
        item.codMatricula === event.analista.codMatriculaDelegado
    );
    if (checaInclusao) {
      this.alertUtils.toastrWarningMsg(
        'Analista já está inserido na lista !!!!!'
      );
      return;
    }

    const dataInicial = this.adicionarTime(event.dataInicial, '00:00:00');
    const dataFinal = this.adicionarTime(event.dataFinal, '23:59:59');

    const usuarioSelecionado = {
      id: null,
      idFichaAnalise: this.idFichaAnalise,
      codMatricula: event.analista.codMatriculaDelegado,
      idUnidade: event.analista.idUnidadeDelegado,
      tipoPermissao: event.tipoPermissao,
      permissao: event.permissao,
      dataInicial: dataInicial,
      dataFinal: dataFinal,
      nomeServidor: event.analista.nomeServidor,
      login: event.analista.login,
      nome: event.analista.nomeServidor,
      emailServidor: event.analista.login + '@stj.jus.br',
    };
    this.analistasList.push(usuarioSelecionado);
    this.page.content = this.analistasList;
    this.page.totalElements = this.analistasList.length;
  }

  private setAnalistasFichaAnalise(analistas: any[]) {
    const matriculas = analistas.map((a) => a.codMatricula).join(',');
    this.sarhclientservice.getServidoresPorMatricula(matriculas).subscribe({
      next: (servidores: any[]) => {
        this.analistasList = analistas.map((a: any) => {
          const tipoPermissao = this.permissaoList.filter(
            (p) => p.chave === a.tipoPermissao
          );

          return {
            //  ...a,
            idFichaAnalise: a.idFichaAnalise,
            tipoPermissao: a.tipoPermissao,
            login: servidores.filter(
              (s) => s.codMatricula === a.codMatricula
            )[0].nomeNick,
            nome: servidores.filter((s) => s.codMatricula === a.codMatricula)[0]
              .nomeServidor,
            dataInicial: this.adicionarTime(a.dataInicial, '00:00:00'),
            dataFinal: this.adicionarTime(a.dataFinal, '00:00:00'),
            codMatricula: a.codMatricula,
            idUnidade: a.IdUnidade,
            permissao: tipoPermissao[0].descricao,
            emailServidor:
              servidores.filter((s) => s.codMatricula === a.codMatricula)[0]
                .nomeNick + '@stj.jus.br',
          };
        });
        this.page.content = this.analistasList;
        this.page.totalElements = this.analistasList.length;
      },
    });
    this.page.content = this.analistasList;
    this.page.totalElements = this.analistasList.length;
  }

  getTipoPermisaoService() {
    this.tipoPermisaoService
      .getEtpTipoPermissaoList()
      .subscribe((permissao) => {
        this.permissaoList = permissao.filter(
          (p) => p.chave === 'RESPONSAVEL' || p.chave === 'REVISOR'
        );
      });
  }

  public setaDatasFichaDeAnalise(fichaAnalise: any, form: any) {
    const qtdDiasTotalProcedimento =
      this.qtdDiasLimiteAnalista + this.qtdDiasLimiteRevisor;
    const qtdDiasLimiteAnalista = this.qtdDiasLimiteAnalista;
    const qtdDiasLimiteRevisor =
      this.qtdDiasLimiteAnalista + this.qtdDiasLimiteRevisor;

    fichaAnalise.entradaUnidade = this.adicionarDias(0);
    fichaAnalise.limiteSaidaUnidade = this.adicionarDias(
      qtdDiasTotalProcedimento
    );
    fichaAnalise.limiteAnalista = this.adicionarDias(qtdDiasLimiteAnalista);
    fichaAnalise.limiteRevisor = this.adicionarDias(qtdDiasLimiteRevisor);

    if (form) {
      form
        .get('dataLimiteAnalista')
        ?.setValue(fichaAnalise.limiteAnalista, { emitEvent: false });
      form
        .get('dataLimiteSaida')
        ?.setValue(fichaAnalise.limiteSaidaUnidade, { emitEvent: false });
      form
        .get('dataLimiteRevisor')
        ?.setValue(fichaAnalise.limiteRevisor, { emitEvent: false });
    }
  }

  public calculaDiferencaDias(dataAnterior: any, novaData: any): number {
    const data1 = new Date(dataAnterior);
    const data2 = new Date(novaData);

    // Diferença em milissegundos
    const diffMs = data2.getTime() - data1.getTime();

    // Diferença em dias
    const diffDias = diffMs / (1000 * 60 * 60 * 24);

    return diffDias;
  }

  public setaTimeFichaDeAnalise(fichaAnalise: any) {
    fichaAnalise.limiteRevisor = this.converterData(
      new Date(fichaAnalise.limiteRevisor)
    );
  }

  adicionarDias(dias: number): string {
    const novaData = new Date();

    // está fixo abaixo.#fichaAnalise
    novaData.setDate(novaData.getDate() + dias);

    return (
      novaData.getFullYear() +
      '-' +
      String(novaData.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(novaData.getDate()).padStart(2, '0')
    );
  }

  converterData(data: Date): string {
    return (
      data.getFullYear() +
      '-' +
      String(data.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(data.getDate()).padStart(2, '0')
    );
  }

  adicionarTime(data: string, time: string): string | null {
    if (!data) return null;

    const novaData = new Date(data.replaceAll('/', '-') + 'T' + time);
    return (
      novaData.getFullYear() +
      '-' +
      String(novaData.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(novaData.getDate()).padStart(2, '0') +
      'T' +
      time
    );
  }

  async onPrioridadeChange(event: any) {
    const prioridadeFormValue =
      this.fichaAnaliseModalForm?.get('prioridade')?.value;

    let prioridade = this.prioridadeList.filter(
      (p) => p.chave === prioridadeFormValue
    );

    if (event && event.id) {
      prioridade = [event]; // precisa ser array, já que você usa prioridade[0]
    }

    const prazo = this.etpPrazoList.filter(
      (prazo: any) =>
        prazo.idPrioridade == prioridade[0]?.id &&
        prazo.idEtapa == this.etp.etpEtapa.id
    );

    if (prazo && prazo[0]) {
      this.qtdDiasLimiteRevisor = prazo[0].qtdDiasLimiteRevisor;
      this.qtdDiasLimiteAnalista = prazo[0].qtdDiasLimiteAnalista;
    } else {
      this.alertUtils.toastrWarningMsg(
        'Não há prazos cadastrados para o tipo de contratação do ETP, etapa e prioridade informados.'
      );
    }

    this.setaDatasFichaDeAnalise(this.fichaAnalise, this.fichaAnaliseModalForm);
  }
}

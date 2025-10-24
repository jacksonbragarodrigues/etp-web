import {Component, TemplateRef, ViewChild} from "@angular/core";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertUtils} from "../../../../utils/alerts.util";
import {Sarhclientservice} from "../../../services/sarhclient.service";
import {EtpTipoPermissaoService} from "../../../services/etp-tipo-permissao.service";
import {TipoDelegacaoService} from "../../../services/tipo-delegacao.service";
import {DelegacaoAcessoService} from "../../../services/delegacao-acesso.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-delegar-acesso',
  templateUrl: './delegar-acesso.component.html',
  styleUrl: './delegar-acesso.component.scss',
})
export class DelegarAcessoComponent {
  @ViewChild('delegarAcessoComponent', {static: true}) private modalContent:
    | TemplateRef<DelegarAcessoComponent>
    | undefined;
  modalRef!: NgbModalRef;

  public delegacaoForm!: FormGroup;
  public delegacao: any = {
    idFomularioEtp: null,
    tipo: 'ETP'
  };

  public index: number = 0;
  //dominios
  unidadeList: any[] = [];
  servidoresAutorizadosList: any[] = [];
  tipoDelegacaoList: any[] = [];
  tipoPermisaoList: any[] = [];
  allTipoDelegacaoList: any[] = [];
  allTipoPermisaoList: any[] = [];
  //Listas de sugestoes
  unidadeListFilter: any[] = [];
  servidorListFilter: any[] = [];

  //acessoDocumentoSelected: any[] = [];
  servidoresSelecionados: any[] = [];
  usuariosAutorizados: any[] = [];

  unidade!: any;
  dataInicial = new Date();
  servidorSelecionado: any;
  unidadeSelecionada: any
  setarTodosServidores!: boolean;

  public titulo?: string = '';

  constructor(
    public modalService: NgbModal,
    private formBuilder: FormBuilder,
    private alertUtils: AlertUtils,
    private sarhclientservice: Sarhclientservice,
    private tipoPermisaoService: EtpTipoPermissaoService,
    private tipoDelegacaoService: TipoDelegacaoService,
    private delegacaoAcessoService: DelegacaoAcessoService,
    public datePipe: DatePipe
  ) {
  }

  onTabChange(event: any) {
    this.index = event.index;
  }

  getUnidades() {
    this.sarhclientservice.getListaUnidades().subscribe((unidadesList) => {
      this.unidadeList = unidadesList.map((unidade) => {
        unidade = {
          ...unidade,
          descricaoSigla: `${unidade.sigla} - ${unidade.descricao}`,
        };
        return unidade;
      });
    });
  }

  getTipoPermisaoService(tipoDelegacao: any) {
    this.tipoPermisaoService.getEtpTipoPermissaoList().subscribe((tipoPermissaoList) => {
      this.allTipoPermisaoList = tipoPermissaoList;
      if (tipoDelegacao === 'ETP') {
        this.tipoPermisaoList = tipoPermissaoList.filter(p => p.chave === 'EDICAO' || p.chave === 'CONSULTA');
      } else {
        this.tipoPermisaoList = tipoPermissaoList;
      }
    })
  }

  getTipoDelegacao(tipoDelegacao: any) {
    this.tipoDelegacaoService.getTipoDelegacaoLista().subscribe((tipoDelegacaoList) => {
      this.allTipoDelegacaoList = tipoDelegacaoList;
      if (tipoDelegacao === 'ETP') {
        this.tipoDelegacaoList = tipoDelegacaoList.filter(d => d.chave === 'ELABORACAO');
      } else {
        this.tipoDelegacaoList = tipoDelegacaoList;
      }
    })
  }

  getListaServidoresAutorizados(id?: any, tipoDelegacao?: any) {
    this.delegacaoAcessoService.getDelegacaoAcesso(id, tipoDelegacao)
      .subscribe((servidoresAutorizados) => {
        this.servidoresAutorizadosList = servidoresAutorizados.map(s => {
          s = {
            ...s,
            descDelegacao: this.allTipoDelegacaoList.find(d => d.id === s.idTipoDelegacao).descricao,
            descPermisao: this.allTipoPermisaoList.find(p => p.id === s.idTipoPermissao).descricao,
          }
          return s;
        });
      });
  }

  private reset() {
    this.servidoresSelecionados = [];
    this.servidoresAutorizadosList = [];
    this.servidorListFilter = [];
    this.unidadeList = [];
    this.unidadeListFilter = [];
    this.servidorSelecionado = null;
    this.unidadeSelecionada = null;
    this.formControl['dataFinal'].setValue(null);
    this.unidade = null;
    this.servidorSelecionado = null;
    this.index = 0;
  }

  open(
    idFomularioEtp: any,
    tipoDelegacao: any
  ): Promise<boolean> {

    this.getUnidades();
    this.getTipoPermisaoService(tipoDelegacao);
    this.getTipoDelegacao(tipoDelegacao);
    this.getListaServidoresAutorizados(idFomularioEtp, tipoDelegacao);
    this.delegacao.id = idFomularioEtp;
    if (tipoDelegacao === 'ETP') {
      this.titulo = 'Delegação de acesso ao ETP';
      this.delegacao.tipo = tipoDelegacao;
    } else if (tipoDelegacao === 'FORMULARIO') {
      this.titulo = 'Delegação de acesso ao Formulário';
      this.delegacao.tipo = tipoDelegacao;
    }
    this.delegacao.idFomularioEtp = idFomularioEtp;
    this.delegacaoForm = this.formBuilder.group({
      usuario: [this.servidoresAutorizadosList],
      unidade: [this.unidadeList],
      dataInicial: [new Date(), Validators.compose([Validators.required])],
      dataFinal: null,
    });

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

  public buscarServidoresPorNome(event: any) {
    const query = event.query;
    this.sarhclientservice.getServidoresPorNome(query).subscribe((servidorList) => {
      this.servidorListFilter = servidorList;
    })
  }

  public buscarServidoresPorUnidade() {
    this.sarhclientservice.getServidoresPorUnidade(this.unidadeSelecionada.id).subscribe((servidorList) => {
      this.servidoresSelecionados = [];
      servidorList.forEach(servidor => {
        const servidorEncontrado = this.servidoresAutorizadosList.find(servidorAutorizado =>
          servidorAutorizado.codMatriculaDelegado === servidor.codMatriculaDelegado);
        if (servidorEncontrado) {
          servidorEncontrado.delegar = true;
          this.servidoresSelecionados.push(servidorEncontrado);
        } else {
          servidor.idTipoDelegacao = this.tipoDelegacaoList[0].id;
          servidor.idTipoPermissao = this.tipoPermisaoList[0].id;
          this.servidoresSelecionados.push(servidor);
        }
      });
    })
  }

  clearServidoresSelecionados() {
    this.servidoresSelecionados = [];
  }

  onServidorSelecionado(event: any) {
    this.servidoresSelecionados = [];
    this.unidade = null;
    const servidorEncontrado = this.servidoresAutorizadosList.find(servidorAutorizado =>
      servidorAutorizado.codMatriculaDelegado === event.value.codMatriculaDelegado);
    if (servidorEncontrado) {
      servidorEncontrado.delegar = true;
      this.servidoresSelecionados.push(servidorEncontrado);
    } else {
      event.value.idTipoDelegacao = this.tipoDelegacaoList[0].id;
      event.value.idTipoPermissao = this.tipoPermisaoList[0].id;
      this.servidoresSelecionados.push(event.value);
    }
    this.setarTodosServidores = false;
  }

  public buscarUnidades(event: any) {
    const query = event.query;
    this.unidadeListFilter = this.unidadeList.filter(unidade =>
      unidade.descricaoSigla.toLowerCase().includes(query.toLowerCase()))
  }

  onUnidadeSelecionada(unidade: any) {
    this.servidorSelecionado = null;
    this.unidadeSelecionada = unidade.value;
    if (this.unidadeSelecionada !== undefined && this.unidadeSelecionada !== null) {
      this.buscarServidoresPorUnidade();
    } else {
      this.servidoresSelecionados = [];
    }
    this.setarTodosServidores = false;
  }

  salvar() {
    if (this.delegacaoForm.valid) {
      const dataInicioPermissao = this.formControl['dataInicial'].value.toISOString();
      let dataFimPermissao = this.formControl['dataFinal'].value;
      if (dataFimPermissao) {
        dataFimPermissao = dataFimPermissao.toISOString();
      }
      let delegacaoAcesso: any[] = [];

      this.servidoresSelecionados.forEach((servidor, index) => {
        if (servidor.delegar) {
          const delegacao = {
            idDelegacao: servidor.idDelegacao,
            tipo: this.delegacao.tipo,
            idEtp: this.delegacao.idFomularioEtp,
            idFormulario: this.delegacao.idFomularioEtp,
            codMatriculaDelegado: servidor.codMatriculaDelegado,
            idUnidadeDelegado: servidor.idUnidadeDelegado,
            dataInicioPermissao: dataInicioPermissao,
            dataFimPermissao: dataFimPermissao,
            idTipoPermissao: servidor.idTipoPermissao,
            servidores: this.servidoresSelecionados,
            idTipoDelegacao: servidor.idTipoDelegacao,
          }
          delegacaoAcesso.push(delegacao);
        }
      });
      this.delegacaoAcessoService.postDelegacaoAcesso(delegacaoAcesso)
        .subscribe({
          next: (data: any) => {
            this.alertUtils.handleSucess('Os acessos foram definidos com sucesso!')
            this.servidoresSelecionados = [];
            this.close();
          },
          error: (error: any) => {
            this.alertUtils.toastrErrorMsg('Houve um erro ao tentar atualizar os dados!');
          }
        });
    }
  }

  async close() {
    if (this.modalRef) {
      this.reset();
      this.modalRef.close();
    }
  }

  setarTodos() {
    this.servidoresSelecionados.forEach(s => {
      s.delegar = this.setarTodosServidores;
      this.definirPermisao(s);
    });
  }


  definirPermisao(delegacaoAcesso: any) {
    if (delegacaoAcesso.delegar) {
      delegacaoAcesso.dataInicioPermissao = this.datePipe.transform(this.formControl['dataInicial'].value, 'dd/MM/yyy');
      delegacaoAcesso.dataFimPermissao = this.datePipe.transform(this.formControl['dataFinal'].value, 'dd/MM/yyy');
    } else {
      delegacaoAcesso.dataInicioPermissao = undefined;
      delegacaoAcesso.dataFimPermissao = undefined;
    }
  }

  async remover(delegacaoAcesso: any) {
    this.alertUtils.confirmDialog(
      'Tem certeza que deseja remover as permissões de acesso deste usuário?')
      .then((dataConfirme) => {
        if (dataConfirme) {
          this.delegacaoAcessoService.deleteDelegacaoAcesso(delegacaoAcesso.idDelegacao)
            .subscribe({
              next: (data: any) => {
                this.listarTodosPorEtp();
                this.servidoresAutorizadosList = this.servidoresAutorizadosList.filter(s => s.idDelegacao != delegacaoAcesso.idDelegacao);
                this.alertUtils.handleSucess('A permissão de acesso ao documento foi retirada com sucesso!');
              },
              error: (error: any) => {
                this.alertUtils.toastrErrorMsg('Houve um erro ao tentar excluir os dados.');
              }
            });
        }
      });
  }

  listarTodosPorEtp() {
    this.delegacaoAcessoService.getDelegacaoAcesso(this.delegacao.id, this.delegacao.tipo).subscribe({
      next: (data: any) => {
        this.usuariosAutorizados = data;
      }
    });
  }

  onPermissaoChange(usuario: any, event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    usuario.idTipoPermissao = selectedValue;
  }

  onDelegacaoChange(usuario: any, event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    usuario.idTipoDelegacaoo = selectedValue;
  }


  get formControl() {
    return this.delegacaoForm.controls;
  }

}

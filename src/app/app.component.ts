import { AuthService, DadosUsuarioLogado } from '@administrativo/core';

import { Component } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ServidorService } from 'src/app/services/servidor.service';
import { environment } from 'src/environments/environment';
import { ErrorService } from './shared/service/error.service';
import { Permissoes } from './enums/permissoes';
import { PrimeNGConfig } from 'primeng/api';
import { AlertUtils } from 'src/utils/alerts.util';

const gtag: Function = new Function();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  titulo = 'eEtp/STJ';
  subtitulo = '';
  menu: any;
  booleanLogin: boolean = false;
  matricula: any;
  gestorTitularSubstituto: any;
  dadosBasicoServidor: any;
  unidadeUsuarioLogado: any;
  dadosUsuarioUnidade: any;
  dadosUsuarioLogado: BehaviorSubject<DadosUsuarioLogado | null> | undefined;
  tokenDecodificado: any;
  navigationStart: any;
  menuStart: boolean = false;
  showMenuCa = environment.menuCa;
  booleanLogout: boolean = false;

  constructor(
    public router: Router,
    public authService: AuthService,
    public servidorService: ServidorService,
    public erroService: ErrorService,
    public alertUtils: AlertUtils,
    private config: PrimeNGConfig
  ) {}

  ngOnInit() {
    document.addEventListener('version:changed', () => {
      this.alertUtils
        .okModalDialog(
          'Uma nova versão do aplicativo está disponível! Atualização será realizada'
        )
        .then(() => {
          window.location.reload();
          window.location.replace(window.location.href);
        });
    });

    this.config.setTranslation({
      apply: 'Aplicar',
      clear: 'Limpar',
      accept: 'Sim',
      reject: 'Não',
      firstDayOfWeek: 0,
      dayNames: [
        'Domingo',
        'Segunda',
        'Terça',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sábado',
      ],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
      monthNames: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],
      monthNamesShort: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],
      today: 'Hoje',
    });

    this.authService.dadosUsuarioLogado.subscribe((resp) => {
      this.matricula = resp?.matricula;
      if (!this.booleanLogin) {
        this.handlePermissionAndMenu();
      }
    });

    /** START : Code to Track Page View using gtag.js */

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects,
        });
      });
  }

  onLogout() {
    this.erroService.setInterceptedError(null);
    this.router.navigate(['/login']);
  }

  eventRouter() {
    if (!this.authService.estaAutenticado()) {
      this.booleanLogin = false;
      this.menu = [];
    }
  }

  handlePermissionAndMenu() {
    this.booleanLogin = true;
    if (this.matricula != null) {
      this.handleMenu(true);
    } else {
      this.handleMenu(false);
    }
  }

  handleMenu(boolSempreVisivel: boolean) {
    this.menu = [
      {
        nome: 'Gestão de Modelo',
        icone: 'fas fa-envelope',
        href: 'gestao-formulario',
        siglaPermissao: [Permissoes.GESTAO_FORMULARIO],
      },
      {
        nome: 'Elaboração de ETP',
        icone: 'fas fa-file-lines',
        href: 'etp',
        siglaPermissao: [Permissoes.ELABORACAO_ETP],
      },
      {
        nome: 'ETP Análise',
        icone: 'fas fa-file-lines',
        href: 'analise-etp',
        siglaPermissao: [Permissoes.ELABORACAO_ETP],
      },
      {
        nome: 'Configuração',
        icone: 'fa fa-fw fa-cog',
        itens: [
          {
            nome: 'Assunto',
            icone: 'fas fa-book',
            href: 'assunto',
            siglaPermissao: [Permissoes.ASSUNTO],
          },
          {
            nome: 'Tipos de Contratação',
            icone: 'fas fa-sack-dollar',
            href: 'etp-tipo-licitacao',
            siglaPermissao: [Permissoes.TIPO_CONTRATACAO],
            separador: '----',
          },
          {
            nome: 'Situação',
            icone: 'fas fa-info-circle',
            href: 'situacao',
            siglaPermissao: [Permissoes.SITUACAO],
          },

          {
            nome: 'Etapas ETP',
            icone: 'fas fa-step-forward',
            href: 'etp-etapa',
            siglaPermissao: [Permissoes.ETAPAS_ETP],
          },
          {
            nome: 'Tipos de Delegação',
            icone: 'fas fa-tags',
            href: '/tipo-delegacao',
            siglaPermissao: [Permissoes.TIPO_DELEGACAO],
          },
          {
            nome: 'Etp Tipo Permissão',
            icone: 'fas fa-lock',
            href: '/etp-tipo-permissao',
            siglaPermissao: [Permissoes.ETP_TIPO_PERMISSAO],
          },
          {
            nome: 'Rótulos',
            icone: 'fas fa-tags',
            href: '/rotulos',
            siglaPermissao: [Permissoes.ROTULOS],
          },
          {
            nome: 'Controle da Numeração',
            icone: 'fas fa-file-signature',
            href: '/etp-numeracao',
            siglaPermissao: [Permissoes.NUMERACAO_ETP],
          },
        ],
      },
    ];
  }
}

export function getEnvironment() {
  return environment;
}

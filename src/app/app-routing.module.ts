import {
  LoginComponent,
  PaginaAcessoNegadoComponent,
  PaginaNaoEncontradaComponent,
} from '@administrativo/components';
import { AuthGuard } from '@administrativo/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorHandleGuard } from './auth/error-handle.guard';
import { Permissoes } from './enums/permissoes';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'gestao-formulario',
    loadChildren: () =>
      import('./pages/principal/principal.module').then(
        (m) => m.PrincipalModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de Modelo',
      authorities: [Permissoes.GESTAO_FORMULARIO, Permissoes.MODELO_CONSULTA],
    },
  },
  {
    path: 'situacao',
    loadChildren: () =>
      import('./pages/situacao/situacao.module').then((m) => m.SituacaoModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de situação',
      authorities: [Permissoes.SITUACAO],
    },
  },
  {
    path: 'etp-tipo-permissao',
    loadChildren: () =>
      import('./pages/etp-tipo-permissao/etp-tipo-permissao.module').then(
        (m) => m.EtpTipoPermissaoModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de situação',
      authorities: [Permissoes.SITUACAO],
    },
  },
  {
    path: 'rotulos',
    loadChildren: () =>
      import('./pages/rotulos/rotulos.module').then((m) => m.RotulosModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de situação',
      authorities: [Permissoes.ROTULOS],
    },
  },
  {
    path: 'assunto',
    loadChildren: () =>
      import('./pages/assunto/assunto.module').then((m) => m.AssuntoModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de assunto',
      authorities: [Permissoes.ASSUNTO],
    },
  },
  {
    path: 'etp',
    loadChildren: () =>
      import('./pages/etp/etp.module').then((m) => m.EtpModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de etp',
      authorities: [Permissoes.ELABORACAO_ETP, Permissoes.ETP_CONSULTA],
    },
  },
  {
    path: 'analise-etp',
    loadChildren: () =>
      import('./pages/etp-analise/etp-analise.module').then(
        (m) => m.EtpAnaliseModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de etp análise',
      authorities: [Permissoes.ELABORACAO_ETP, Permissoes.ETP_CONSULTA],
    },
  },
  {
    path: 'desbloqueio-etp',
    loadChildren: () =>
      import('./pages/gestao-etp-bloqueados/gestao-etp-bloqueados.module').then(
        (m) => m.GestaoEtpBloqueadosModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: { title: 'Gestão de etp', authorities: [Permissoes.ETP_BLOQUEADOS] },
  },
  {
    path: 'desbloqueio-formulario',
    loadChildren: () =>
      import(
        './pages/gestao-formulario-bloqueados/gestao-formulario-bloqueados.module'
      ).then((m) => m.GestaoFormularioBloqueadosModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de etp',
      authorities: [Permissoes.FORMULARIOS_BLOQUEADOS],
    },
  },
  {
    path: 'etp-tipo-licitacao',
    loadChildren: () =>
      import('./pages/etp-tipo-licitacao/etp-tipo-licitacao.module').then(
        (m) => m.EtpTipoLicitacaoModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de tipo de contratação',
      authorities: [Permissoes.TIPO_CONTRATACAO],
    },
  },
  {
    path: 'etp-etapa',
    loadChildren: () =>
      import('./pages/etp-etapa/etp-etapa.module').then(
        (m) => m.EtpEtapaModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: { title: 'Gestão de etapa', authorities: [Permissoes.ETAPAS_ETP] },
  },
  {
    path: 'etp-numeracao',
    loadChildren: () =>
      import('./pages/etp-numeracao/etp-numeracao.module').then(
        (m) => m.EtpNumeracaoModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Controle da Numeração',
      authorities: [Permissoes.NUMERACAO_ETP],
    },
  },
  {
    path: 'tipo-delegacao',
    loadChildren: () =>
      import('./pages/tipo-delegacao/tipo-delegacao.module').then(
        (m) => m.TipoDelegacaoModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de tipo de delegação',
      authorities: [Permissoes.TIPO_DELEGACAO],
    },
  },
  {
    path: 'prioridade',
    loadChildren: () =>
      import('./pages/prioridade/prioridade.module').then(
        (m) => m.PrioridadeModule
      ),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard, ErrorHandleGuard],
    data: {
      title: 'Gestão de prioridade',
      authorities: [Permissoes.PRIORIDADE],
    },
  },
  {
    path: 'acesso-negado',
    component: PaginaAcessoNegadoComponent,
  },
  {
    path: '**',
    component: PaginaNaoEncontradaComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

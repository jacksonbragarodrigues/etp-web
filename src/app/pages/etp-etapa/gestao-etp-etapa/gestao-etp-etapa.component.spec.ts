import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';

import { GestaoEtpEtapaComponent } from './gestao-etp-etapa.component';
import { EtpEtapaModule } from '../etp-etapa.module';
import { EtpEtapaService } from 'src/app/services/etp-etapa-service.service';

describe('GestaoEtpEtapaComponent', () => {
  let component: GestaoEtpEtapaComponent;
  let fixture: ComponentFixture<GestaoEtpEtapaComponent>;
  let gestaoEtpEtapaService: EtpEtapaService;
  let alertUtils: AlertUtils;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpEtapaComponent],
      imports: [EtpEtapaModule, AppModule, HttpClientTestingModule],
      providers: [EtpEtapaService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpEtapaComponent);
    component = fixture.componentInstance;
    alertUtils = TestBed.inject(AlertUtils);
    gestaoEtpEtapaService = TestBed.inject(EtpEtapaService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaPage e tableLazyLoading no ngOnInit', () => {
    spyOn(component, 'iniciaPage');
    spyOn(component, 'tableLazyLoading');

    component.ngOnInit();

    expect(component.iniciaPage).toHaveBeenCalled();
    expect(component.tableLazyLoading).toHaveBeenCalled();
  });

  it('deve inicializar o objeto page corretamente', () => {
    // Chame a função iniciaPage
    component.iniciaPage();

    // Verifique se o objeto page foi criado corretamente
    expect(component.page).toEqual({
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: component.page.totalElements,
      totalPages: Math.ceil(component.page.totalElements / component.page.size),
    });
  });

  it('deve redefinir a direção de classificação para colunas não selecionadas', () => {
    component.page.sort = 'descricao,asc';
    const coluna = 'descricao';
    const direcao = 'desc';
    spyOn(component, 'getPesquisaretpEtapa');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisaretpEtapa).toHaveBeenCalled();
    component.headers.forEach((header: any) => {
      if (header.sortable !== coluna) {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe(direcao);
      }
    });
  });

  it('deve chamar a funcao tableLazyLoading', () => {
    const response: any = {};
    const service: EtpEtapaService =
      fixture.debugElement.injector.get(EtpEtapaService);
    spyOn(service, 'getEtpEtapa').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getEtpEtapa).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisaretpEtapa', () => {
    const response: any = {};
    const service: EtpEtapaService =
      fixture.debugElement.injector.get(EtpEtapaService);
    spyOn(service, 'getEtpEtapa').and.returnValue(of(response));
    component.getPesquisaretpEtapa(true);
    expect(service.getEtpEtapa).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpEtapa POST', () => {
    const response: any = {};
    const objEtpEtapa = {
      descricao: 'teste',
    };
    const service: EtpEtapaService =
      fixture.debugElement.injector.get(EtpEtapaService);
    spyOn(service, 'postEtpEtapa').and.returnValue(of(response));
    component.gravarEtpEtapa(objEtpEtapa);
    expect(service.postEtpEtapa).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarEtpEtapa PUT', () => {
    const response: any = {};
    const objEtpEtapa = {
      id: 1,

      descricao: 'teste',
    };
    const service: EtpEtapaService =
      fixture.debugElement.injector.get(EtpEtapaService);
    spyOn(service, 'putEtpEtapa').and.returnValue(of(response));
    component.gravarEtpEtapa(objEtpEtapa);
    expect(service.putEtpEtapa).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objEtpEtapa = {
      id: 1,
    };
    const service: EtpEtapaService =
      fixture.debugElement.injector.get(EtpEtapaService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(service, 'deleteEtpEtapa').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirEtpEtapa(objEtpEtapa);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarEtpEtapa', () => {
    spyOn(component.CADASTRAR_ETP_ETAPA, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarEtpEtapa();

    expect(component.CADASTRAR_ETP_ETAPA.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarEtpEtapa', () => {
    spyOn(component.CADASTRAR_ETP_ETAPA, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarEtpEtapa({ id: 1 });

    expect(component.CADASTRAR_ETP_ETAPA.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoEtpEtapaFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoEtpEtapaFiltroForm.reset).toHaveBeenCalled();
  });

  it('deve testar getDataModificacao e getUsuarioModificacao', () => {
    const itemAlteracao = {
      dataAlteracao: new Date(),
      usuarioAlteracao: 'testeAlteracao',
    };

    const itemRegistro = {
      dataAlteracao: null,
      dataRegistro: new Date(),
      usuarioRegistro: 'testeRegistro',
    };

    expect(component.gestaoBase.getDataModificacao(itemAlteracao)).toEqual(
      itemAlteracao.dataAlteracao
    );
    expect(component.gestaoBase.getUsuarioModificacao(itemAlteracao)).toEqual(
      itemAlteracao.usuarioAlteracao
    );
    expect(component.gestaoBase.getDataModificacao(itemRegistro)).toEqual(
      itemRegistro.dataRegistro
    );
    expect(component.gestaoBase.getUsuarioModificacao(itemRegistro)).toEqual(
      itemRegistro.usuarioRegistro
    );
  });
});

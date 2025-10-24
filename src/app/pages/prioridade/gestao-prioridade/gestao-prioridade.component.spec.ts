import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { GestaoPrioridadeComponent } from './gestao-prioridade.component';
import { PrioridadeModule } from '../prioridade.module';
import { PrioridadeService } from 'src/app/services/prioridade.service';

describe('GestaoPrioridadeComponent', () => {
  let component: GestaoPrioridadeComponent;
  let fixture: ComponentFixture<GestaoPrioridadeComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoPrioridadeComponent],
      imports: [PrioridadeModule, AppModule, HttpClientTestingModule],
      providers: [PrioridadeService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoPrioridadeComponent);
    component = fixture.componentInstance;
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
    spyOn(component, 'getPesquisarPrioridade');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarPrioridade).toHaveBeenCalled();
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
    const service: PrioridadeService =
      fixture.debugElement.injector.get(PrioridadeService);
    spyOn(service, 'getPrioridade').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getPrioridade).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarPrioridade', () => {
    const response: any = {};
    const service: PrioridadeService =
      fixture.debugElement.injector.get(PrioridadeService);
    spyOn(service, 'getPrioridade').and.returnValue(of(response));
    component.getPesquisarPrioridade(true);
    expect(service.getPrioridade).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarPrioridade POST', () => {
    const response: any = {};
    const objPrioridade = {
      descricao: 'teste',
    };
    const service: PrioridadeService =
      fixture.debugElement.injector.get(PrioridadeService);
    spyOn(service, 'postPrioridade').and.returnValue(of(response));
    component.gravarPrioridade(objPrioridade);
    expect(service.postPrioridade).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarPrioridade PUT', () => {
    const response: any = {};
    const objPrioridade = {
      id: 1,

      descricao: 'teste',
    };
    const service: PrioridadeService =
      fixture.debugElement.injector.get(PrioridadeService);
    spyOn(service, 'putPrioridade').and.returnValue(of(response));
    component.gravarPrioridade(objPrioridade);
    expect(service.putPrioridade).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objPrioridade = {
      id: 1,
    };
    const service: PrioridadeService =
      fixture.debugElement.injector.get(PrioridadeService);
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(service, 'deletePrioridade').and.returnValue(of(response));
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirPrioridade(objPrioridade);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarPrioridade', () => {
    spyOn(component.CADASTRAR_PRIORIDADE, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarPrioridade();

    expect(component.CADASTRAR_PRIORIDADE.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarPrioridade', () => {
    spyOn(component.CADASTRAR_PRIORIDADE, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarPrioridade({ id: 1 });

    expect(component.CADASTRAR_PRIORIDADE.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoPrioridadeFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoPrioridadeFiltroForm.reset).toHaveBeenCalled();
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

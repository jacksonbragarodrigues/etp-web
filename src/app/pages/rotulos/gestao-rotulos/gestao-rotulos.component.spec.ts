import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';

import { AppModule } from 'src/app/app.module';
import { of } from 'rxjs';
import { RotulosFormularioService } from 'src/app/services/rotulos-formulario-service.service';
import { RotulosModule } from '../rotulos.module';
import { GestaoRotulosComponent } from '../gestao-rotulos/gestao-rotulos.component';

describe('GestaoRotulosComponent', () => {
  let component: GestaoRotulosComponent;
  let fixture: ComponentFixture<GestaoRotulosComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoRotulosComponent],
      imports: [RotulosModule, AppModule, HttpClientTestingModule],
      providers: [RotulosFormularioService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoRotulosComponent);
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
    component.page.sort = 'de,asc';
    const coluna = 'de';
    const direcao = 'desc';
    spyOn(component, 'getPesquisarRotulos');
    component.onSort({ coluna, direcao });
    expect(component.page.sort).toBe(`${coluna},${direcao}`);
    expect(component.getPesquisarRotulos).toHaveBeenCalled();
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
    const service: RotulosFormularioService = fixture.debugElement.injector.get(
      RotulosFormularioService
    );
    spyOn(service, 'getRotulos').and.returnValue(of(response));
    component.tableLazyLoading(true);
    expect(service.getRotulos).toHaveBeenCalled();
  });

  it('deve chamar a funcao getPesquisarRotulos', () => {
    const response: any = {};
    const service: RotulosFormularioService = fixture.debugElement.injector.get(
      RotulosFormularioService
    );
    spyOn(service, 'getRotulos').and.returnValue(of(response));
    component.getPesquisarRotulos(true);
    expect(service.getRotulos).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarRotulos POST', () => {
    const response: any = {};
    const objRotulos = {
      de: 'teste',
      para: 'teste',
    };
    const service: RotulosFormularioService = fixture.debugElement.injector.get(
      RotulosFormularioService
    );
    spyOn(service, 'postRotulos').and.returnValue(of(response));
    component.gravarRotulos(objRotulos);
    expect(service.postRotulos).toHaveBeenCalled();
  });

  it('deve chamar a funcao gravarRotulos PUT', () => {
    const response: any = {};
    const objRotulos = {
      id: 1,
      de: 'teste',
      para: 'teste',
    };
    const service: RotulosFormularioService = fixture.debugElement.injector.get(
      RotulosFormularioService
    );
    spyOn(service, 'putRotulos').and.returnValue(of(response));
    component.gravarRotulos(objRotulos);
    expect(service.putRotulos).toHaveBeenCalled();
  });

  it('deve chamar a funcao excluirForfmulario', () => {
    const response: any = {};
    const objRotulos = {
      id: 1,
    };
    const service: RotulosFormularioService = fixture.debugElement.injector.get(
      RotulosFormularioService
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(service, 'deleteRotulos').and.returnValue(of(response));
    spyOn(alert, 'handleSucess');
    spyOn(component, 'tableLazyLoading');
    component.excluirRotulos(objRotulos);
    expect(alert.confirmDialog).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar cadastrarRotulos', () => {
    spyOn(component.CADASTRAR_Rotulos, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.cadastrarRotulos();

    expect(component.CADASTRAR_Rotulos.open).toHaveBeenCalled();
  });

  it('deve chamar open ao chamar editarRotulos', () => {
    spyOn(component.CADASTRAR_Rotulos, 'open'); // Espionando a função open de GERAR_ESCANINHOS.

    component.editarRotulos({ id: 1 });

    expect(component.CADASTRAR_Rotulos.open).toHaveBeenCalled();
  });

  it('deve limpar os campos e resetar o filtro', () => {
    spyOn(component.gestaoRotulosFiltroForm, 'reset'); // Espionando a função open de GERAR_ESCANINHOS.

    component.limparCampos();

    expect(component.gestaoRotulosFiltroForm.reset).toHaveBeenCalled();
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

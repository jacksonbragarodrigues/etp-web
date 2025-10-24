import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';
import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AlertUtils } from 'src/utils/alerts.util';
import { of } from 'rxjs';
import { GestaoFormularioBloqueadosComponent } from './gestao-formulario-bloqueados.component';

describe('GestaoFormularioComponent', () => {
  let component: GestaoFormularioBloqueadosComponent;
  let fixture: ComponentFixture<GestaoFormularioBloqueadosComponent>;

  let gestaoFormularioService: GestaoFormularioService;
  let alertUtils: AlertUtils;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoFormularioBloqueadosComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [GestaoFormularioService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoFormularioBloqueadosComponent);
    component = fixture.componentInstance;
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaFormulariosBloqueados no ngOnInit', fakeAsync(() => {
    spyOn(component, 'iniciaFormulariosBloqueados');

    component.ngOnInit();
    tick();

    expect(component.iniciaFormulariosBloqueados).toHaveBeenCalled();
  }));

  it('deve inicializar o objeto page corretamente', () => {
    component.iniciaPageVersoesFormulario();

    expect(component.pageFormularioBloqueados).toEqual({
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: component.pageFormularioBloqueados.totalElements,
      totalPages: Math.ceil(
        component.pageFormularioBloqueados.totalElements /
          component.pageFormularioBloqueados.size
      ),
    });
  });

  it('deve inicializar corretamente (ngOnInit)', () => {
    const mockEtps = [{ id: 1 }, { id: 2 }];
    spyOn(
      gestaoFormularioService,
      'getFormularioListaBloqueados'
    ).and.returnValue(of(mockEtps));

    component.ngOnInit();

    expect(component.titulo).toBe('Modelos Bloqueados');
    expect(
      gestaoFormularioService.getFormularioListaBloqueados
    ).toHaveBeenCalled();
  });

  it('deve popular a lista de ETPs após carregar bloqueados', () => {
    const mockEtps = [{ id: 1 }, { id: 2 }];
    spyOn(
      gestaoFormularioService,
      'getFormularioListaBloqueados'
    ).and.returnValue(of(mockEtps));

    component.iniciaFormulariosBloqueados();

    expect(component.formularioList).toEqual(mockEtps);
    expect(component.pageFormularioBloqueados.content).toEqual(mockEtps);
  });

  it('deve desbloquear ETP quando confirmado', fakeAsync(() => {
    const etpId = 123;
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoFormularioService, 'putBloqueioFormulario').and.returnValue(
      of({})
    );
    spyOn(
      gestaoFormularioService,
      'getFormularioListaBloqueados'
    ).and.returnValue(of([]));

    component.desbloquearEtp(etpId);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoFormularioService.putBloqueioFormulario).toHaveBeenCalledWith(
      etpId,
      {
        bloqueado: false,
      }
    );
    expect(
      gestaoFormularioService.getFormularioListaBloqueados
    ).toHaveBeenCalled();
  }));

  it('não deve desbloquear ETP quando cancelado', fakeAsync(() => {
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(false));
    spyOn(gestaoFormularioService, 'putBloqueioFormulario');

    component.desbloquearEtp(456);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(
      gestaoFormularioService.putBloqueioFormulario
    ).not.toHaveBeenCalled();
  }));

  it('deve selecionar um item', () => {
    const mockEvent = { stopPropagation: jasmine.createSpy() } as any;
    const item = { id: 10 };

    component.selecionarItem(mockEvent, item);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.selectedRowData).toEqual(item);
  });

  it('deve ordenar corretamente com onSort', () => {
    const mockHeaders = [
      { sortable: 'coluna1', direcao: '' },
      { sortable: 'coluna2', direcao: '' },
    ];
    component.headers.reset(mockHeaders as any);
    component.headers.notifyOnChanges();

    component.onSort({
      colunaEtpBloqueados: 'coluna1',
      direcaoEtpBloqueados: 'asc',
    });

    expect(component.pageFormularioBloqueados.sort).toBe('');
    component.headers.forEach((header: any) => {
      if (header.sortable === 'coluna1') {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe('');
      }
    });
  });
});

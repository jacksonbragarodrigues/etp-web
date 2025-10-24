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
import { GestaoEtpBloqueadosComponent } from './gestao-etp-bloqueados.component';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { of } from 'rxjs';

describe('GestaoFormularioComponent', () => {
  let component: GestaoEtpBloqueadosComponent;
  let fixture: ComponentFixture<GestaoEtpBloqueadosComponent>;

  let gestaoEtpService: GestaoEtpService;
  let alertUtils: AlertUtils;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestaoEtpBloqueadosComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [GestaoFormularioService, AlertUtils],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoEtpBloqueadosComponent);
    component = fixture.componentInstance;
    gestaoEtpService = TestBed.inject(GestaoEtpService);
    alertUtils = TestBed.inject(AlertUtils);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar iniciaEtpsBloqueados no ngOnInit', fakeAsync(() => {
    spyOn(component, 'iniciaEtpsBloqueados');

    component.ngOnInit();
    tick();

    expect(component.iniciaEtpsBloqueados).toHaveBeenCalled();
  }));

  it('deve inicializar o objeto page corretamente', () => {
    component.iniciaPageVersoesEtp();

    expect(component.pageEtpBloqueados).toEqual({
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: component.pageEtpBloqueados.totalElements,
      totalPages: Math.ceil(
        component.pageEtpBloqueados.totalElements /
          component.pageEtpBloqueados.size
      ),
    });
  });

  it('deve inicializar corretamente (ngOnInit)', () => {
    const mockEtps = [{ id: 1 }, { id: 2 }];
    spyOn(gestaoEtpService, 'getEtpListaBloqueados').and.returnValue(
      of(mockEtps)
    );

    component.ngOnInit();

    expect(component.titulo).toBe('ETPs Bloqueados');
    expect(gestaoEtpService.getEtpListaBloqueados).toHaveBeenCalled();
  });

  it('deve popular a lista de ETPs após carregar bloqueados', () => {
    const mockEtps = [{ id: 1 }, { id: 2 }];
    spyOn(gestaoEtpService, 'getEtpListaBloqueados').and.returnValue(
      of(mockEtps)
    );

    component.iniciaEtpsBloqueados();

    expect(component.etpList).toEqual(mockEtps);
    expect(component.pageEtpBloqueados.content).toEqual(mockEtps);
  });

  it('deve desbloquear ETP quando confirmado', fakeAsync(() => {
    const etpId = 123;
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(gestaoEtpService, 'putBloqueioEtp').and.returnValue(of({}));
    spyOn(gestaoEtpService, 'getEtpListaBloqueados').and.returnValue(of([]));

    component.desbloquearEtp(etpId);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoEtpService.putBloqueioEtp).toHaveBeenCalledWith(etpId, {
      bloqueado: false,
    });
    expect(gestaoEtpService.getEtpListaBloqueados).toHaveBeenCalled();
  }));

  it('não deve desbloquear ETP quando cancelado', fakeAsync(() => {
    spyOn(alertUtils, 'confirmDialog').and.returnValue(Promise.resolve(false));
    spyOn(gestaoEtpService, 'putBloqueioEtp');

    component.desbloquearEtp(456);
    tick();

    expect(alertUtils.confirmDialog).toHaveBeenCalled();
    expect(gestaoEtpService.putBloqueioEtp).not.toHaveBeenCalled();
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

    expect(component.pageEtpBloqueados.sort).toBe('coluna1,asc');
    component.headers.forEach((header: any) => {
      if (header.sortable === 'coluna1') {
        expect(header.direcao).toBe('');
      } else {
        expect(header.direcao).toBe('');
      }
    });
  });
});

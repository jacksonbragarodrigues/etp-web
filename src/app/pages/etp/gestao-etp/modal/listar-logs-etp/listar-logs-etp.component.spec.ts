import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ListarLogsEtpComponent } from './listar-logs-etp.component';
import { RemoveZerosProcessoSeiPipe } from '../../../shared/remove-zeros-processo-sei-pipe.pipe';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

//Começando a fase 2

describe('TableSharedEtpComponent', () => {
  let component: ListarLogsEtpComponent;
  let fixture: ComponentFixture<ListarLogsEtpComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let modalRefSpy: jasmine.SpyObj<NgbModalRef>;

  beforeEach(async () => {
    modalRefSpy = jasmine.createSpyObj<NgbModalRef>('NgbModalRef', ['close'], {
      result: Promise.resolve(true),
    });

    modalServiceSpy = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ListarLogsEtpComponent, RemoveZerosProcessoSeiPipe],
      imports: [
        PrincipalModule,
        AppModule,
        HttpClientTestingModule,
        OverlayPanelModule,
        PanelMenuModule,
      ],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(ListarLogsEtpComponent);
    component = fixture.componentInstance;

    // Atribuindo os espiões aos inputs do componente
    component.pageLogEtp = {
      content: [],
      empty: false,
      first: false,
      last: false,
      number: 1,
      numberOfElements: 1,
      pageable: null,
      size: 0,
      sort: null,
      totalElements: 1,
      totalPages: 1,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Deve testar iniciaPageVersoesEtp', () => {
    component.iniciaPageVersoesEtpListaLogs();
    expect(component.pageLogEtp.size).toEqual(10);
  });

  it('Deve testar getDataModificacao', () => {
    const itemTemAlteracao = {
      dtAlteracao: '2025-05-27T16:33:00',
      dtRegistro: '2025-05-26T16:33:00',
    };
    const itemNaoTemAlteracao = {
      dtAlteracao: undefined,
      dtRegistro: '2025-05-26T16:33:00',
    };
    const retornoAlteracao =
      component.getDataModificacaoLogEtp(itemTemAlteracao);
    expect(itemTemAlteracao.dtAlteracao).toEqual(retornoAlteracao);
    const retornoSemAlteracao =
      component.getDataModificacaoLogEtp(itemNaoTemAlteracao);
    expect(itemNaoTemAlteracao.dtRegistro).toEqual(retornoSemAlteracao);
  });

  it('Deve testar getUsuarioModificacao', () => {
    const itemTemAlteracao = {
      codUsuarioAlteracao: 'Alterei',
      codUsuario: 'Registrei',
    };
    const itemNaoTemAlteracao = {
      codUsuarioAlteracao: undefined,
      codUsuario: 'Registrei',
    };
    const retornoAlteracao =
      component.getUsuarioModificacaoLogEtp(itemTemAlteracao);
    expect(itemTemAlteracao.codUsuarioAlteracao).toEqual(retornoAlteracao);
    const retornoSemAlteracao =
      component.getUsuarioModificacaoLogEtp(itemNaoTemAlteracao);
    expect(itemNaoTemAlteracao.codUsuario).toEqual(retornoSemAlteracao);
  });

  it('deve inicializar a página corretamente', () => {
    component.iniciaPageVersoesEtpListaLogs();
    expect(component.pageLogEtp).toEqual(
      jasmine.objectContaining({
        number: 1,
        size: 10,
        totalPages: jasmine.any(Number),
      })
    );
  });

  it('deve abrir o modal e retornar true na promise', fakeAsync(() => {
    modalServiceSpy.open.and.returnValue(modalRefSpy);
    const mockLogs = [{ id: 1 }];
    const promise = component.open(mockLogs);

    tick(); // resolve modalRef.result

    expect(modalServiceSpy.open).toHaveBeenCalled();
    expect(component.listaLogsEtp).toEqual(mockLogs);

    promise.then((result) => {
      expect(result).toBeTrue();
    });
  }));

  it('deve retornar a data de modificação ou registro', () => {
    const item1 = { dtAlteracao: '2023-01-01', dtRegistro: '2022-01-01' };
    const item2 = { dtRegistro: '2022-01-01' };

    expect(component.getDataModificacaoLogEtp(item1)).toBe('2023-01-01');
    expect(component.getDataModificacaoLogEtp(item2)).toBe('2022-01-01');
  });

  it('deve retornar o usuário de modificação ou registro', () => {
    const item1 = { codUsuarioAlteracao: 'admin2', codUsuario: 'admin1' };
    const item2 = { codUsuario: 'admin1' };

    expect(component.getUsuarioModificacaoLogEtp(item1)).toBe('admin2');
    expect(component.getUsuarioModificacaoLogEtp(item2)).toBe('admin1');
  });

  it('deve fechar o modal se estiver aberto', () => {
    component.modalRef = modalRefSpy;
    component.close();

    expect(modalRefSpy.close).toHaveBeenCalled();
  });
});

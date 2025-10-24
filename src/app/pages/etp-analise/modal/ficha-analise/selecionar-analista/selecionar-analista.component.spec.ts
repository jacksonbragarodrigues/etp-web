import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SelecionarAnalistaComponent } from './selecionar-analista.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertUtils } from '../../../../../../utils/alerts.util';
import { Sarhclientservice } from '../../../../../services/sarhclient.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SelecionarAnalistaComponent', () => {
  let component: SelecionarAnalistaComponent;
  let fixture: ComponentFixture<SelecionarAnalistaComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockModalRef: jasmine.SpyObj<NgbModalRef>;
  let sarhclientService: jasmine.SpyObj<Sarhclientservice>;

  beforeEach(async () => {
    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close', 'result']);
    sarhclientService = jasmine.createSpyObj('Sarhclientservice', ['getServidoresPorNome']);

    await TestBed.configureTestingModule({
      declarations: [SelecionarAnalistaComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: NgbModal, useValue: mockModalService },
        { provide: AlertUtils, useValue: {} },
        { provide: Sarhclientservice, useValue: sarhclientService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecionarAnalistaComponent);
    component = fixture.componentInstance;
    mockModalService.open.and.returnValue(mockModalRef);
    mockModalRef.result = Promise.resolve(true);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  // it('deve abrir o modal e inicializar o formulário', fakeAsync(() => {
  //   const permissoes = [{ id: 1, descricao: 'Permissão A' }];
  //   component.open(permissoes, [], []);
  //   tick();
  //
  //   //expect(component.tipoPermisaoList).toEqual(permissoes);
  //   expect(component.selecionarAnalistaForm).toBeDefined();
  //   expect(mockModalService.open).toHaveBeenCalled();
  // }));

  it('deve buscar analistas por nome', () => {
    const servidoresMock = [{ nome: 'João' }];
    sarhclientService.getServidoresPorNome.and.returnValue(of(servidoresMock));

    component.buscarAnalistaPorNome({ query: 'joão' });

    expect(sarhclientService.getServidoresPorNome).toHaveBeenCalledWith('joão');
    expect(component.analistListFilter).toEqual(servidoresMock);
  });

  it('deve selecionar um analista', () => {
    component.onAnalistaSlecionado({ value: 'analista123' });
    expect(component.analistaSelecionado).toBe('analista123');
  });

  it('deve limpar o analista selecionado', () => {
    component.analistaSelecionado = 'alguém';
    component.clearAnalistaSlecionado();
    expect(component.analistaSelecionado).toBeNull();
  });

  // it('deve emitir analista selecionado e fechar modal', () => {
  //   const permissaoList = [{ id: 10, descricao: 'Permissão X' }];
  //   //component.tipoPermisaoList = permissaoList;
  //
  //   component.analistaSelecionado = { nome: 'Fulano' };
  //   component.selecionarAnalistaForm = component['formBuilder'].group({
  //     tipoPermissao: [10],
  //     dataInicial: ['2025-08-01'],
  //     dataFinal: ['2025-08-10'],
  //   });
  //
  //   const emitSpy = spyOn(component.enviarAnalistaSlecionado, 'emit');
  //   const closeSpy = spyOn(component, 'close');
  //
  //   component.enviarAnalistaSelecionado();
  //
  //   expect(emitSpy).toHaveBeenCalledWith({
  //     analista: { nome: 'Fulano' },
  //     tipoPermissao: { id: 10, descricao: 'Permissão X' },
  //     dataInicial: '2025-08-01',
  //     dataFinal: '2025-08-10',
  //   });
  //
  //   expect(closeSpy).toHaveBeenCalled();
  // });

  it('deve fechar o modal e resetar o formulário', () => {
    component.selecionarAnalistaForm = component['formBuilder'].group({
      tipoPermissao: ['1'],
      dataInicial: ['2025-01-01'],
      dataFinal: ['2025-02-01'],
    });

    component.modalRef = mockModalRef;
    component.close();

    expect(mockModalRef.close).toHaveBeenCalled();
  });
});

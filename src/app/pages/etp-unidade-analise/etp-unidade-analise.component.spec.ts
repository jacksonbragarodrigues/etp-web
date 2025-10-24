import { TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertUtils } from 'src/utils/alerts.util';
import { EtpUnidadeAnaliseComponent } from './etp-unidade-analise.component';

describe('EtpUnidadeAnaliseComponent', () => {
  let component: EtpUnidadeAnaliseComponent;
  let fixture: ComponentFixture<EtpUnidadeAnaliseComponent>;
  let modalServiceMock: jasmine.SpyObj<NgbModal>;
  let modalRefMock: jasmine.SpyObj<NgbModalRef>;

  beforeEach(async () => {
    modalRefMock = jasmine.createSpyObj<NgbModalRef>('NgbModalRef', ['close'], { result: Promise.resolve(true) });
    modalServiceMock = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);
    modalServiceMock.open.and.returnValue(modalRefMock);

    await TestBed.configureTestingModule({
      declarations: [EtpUnidadeAnaliseComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: modalServiceMock },
        { provide: AlertUtils, useValue: jasmine.createSpyObj('AlertUtils', ['']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EtpUnidadeAnaliseComponent);
    component = fixture.componentInstance;
    // simula o @ViewChild
    component['modalContent'] = {} as TemplateRef<any>;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('open', () => {
    it('deve setar titulo para Alterar Unidade de Análise quando id existir', async () => {
      const unidadeAnalise = { id: 1, idEtapa: 10, sqIdUnidade: 100, padrao: 1 , dsUnidade: 'nova unidade analise'};
      const etapaList = [{ id: 10, nome: 'Etapa A' }];
      const unidadeList = [{ id: 100, sigla: 'SG', descricao: 'Descricao' }];
      const promise = component.open(unidadeAnalise, etapaList, unidadeList);
      expect(component.titulo).toBe('Alterar Unidade de Análise');
      await expectAsync(promise).toBeResolved();
      expect(component.unidadeAnaliseForm.value).toEqual({
        etapaId: 10,
        unidadeId: jasmine.objectContaining({ id: 100 }),
        padrao: 1,
        descricao: 'nova unidade analise'
      });
      expect(modalServiceMock.open).toHaveBeenCalled();
    });

    it('deve setar titulo para Incluir Unidade de Análise quando id não existir', async () => {
      const unidadeAnalise = { idEtapa: 10, sqIdUnidade: 100, padrao: 0 };
      const etapaList = [{ id: 10 }];
      const unidadeList = [{ id: 100, sigla: 'SG', descricao: 'Descricao' }];
      const promise = component.open(unidadeAnalise, etapaList, unidadeList);
      expect(component.titulo).toBe('Incluir Unidade de Análise');
      await expectAsync(promise).toBeResolved();
    });
  });

  it('deve emitir evento ao chamar enviarUnidadeAnaliseSelecionada', () => {
    component.etpUnidadeAnalise = { id: 5 };
    component.unidadeAnaliseForm = new FormBuilder().group({
      unidadeId: ['unidade'],
      etapaId: ['etapa'],
      padrao: ['padrao'],
      descricao: ['nova unidade analise'],
    });
    spyOn(component.enviarUnidadeAnalise, 'emit');
    spyOn(component, 'close');
    component.enviarUnidadeAnaliseSelecionada();
    expect(component.enviarUnidadeAnalise.emit).toHaveBeenCalledWith({
      unidadeAnaliseId: 5,
      unidade: 'unidade',
      etapa: 'etapa',
      padrao: 'padrao',
      descricao: 'nova unidade analise'
    });
    expect(component.close).toHaveBeenCalled();
  });

  it('close deve resetar form e fechar modal', () => {
    component.unidadeAnaliseForm = new FormBuilder().group({
      unidadeId: ['']
    });
    component.modalRef = modalRefMock;
    component.close();
    expect(component.unidadeAnaliseForm.value).toEqual({ unidadeId: null });
    expect(modalRefMock.close).toHaveBeenCalled();
  });

  describe('buscarUnidades', () => {
    it('deve filtrar unidades pela query', () => {
      component.unidadesList = [
        { sigla: 'AA', descricao: 'Teste' },
        { sigla: 'BB', descricao: 'Outro' }
      ];
      component.buscarUnidades({ query: 'tes' });
      expect(component.unidadeListFiltrada.length).toBe(1);
      expect(component.unidadeListFiltrada[0].descricaoSigla.toLowerCase()).toContain('teste');
    });

    it('deve lidar com lista vazia', () => {
      component.unidadesList = [];
      component.buscarUnidades({ query: 'x' });
      expect(component.unidadeListFiltrada).toEqual([]);
    });
  });
});

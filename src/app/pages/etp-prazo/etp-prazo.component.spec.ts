import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EtpPrazoComponent } from './etp-prazo.component';

describe('EtpPrazoComponent', () => {
  let component: EtpPrazoComponent;
  let fixture: ComponentFixture<EtpPrazoComponent>;
  let mockModalService: jasmine.SpyObj<NgbModal>;
  let mockModalRef: jasmine.SpyObj<NgbModalRef>;
  let formBuilder: FormBuilder;

  const mockEtapasList = [
    { id: 1, descricao: 'Etapa 1' },
    { id: 2, descricao: 'Etapa 2' },
  ];

  const mockPrioridadesList = [
    { id: 1, descricao: 'Alta' },
    { id: 2, descricao: 'Media' },
  ];

  const mockPrazoExistente = {
    id: 1,
    motivacaoPrazo: 'Teste motivação',
    qtdDiasLimiteRevisor: 5,
    qtdDiasLimiteAnalista: 3,
    idEtapa: 1,
    idPrioridade: 1,
    indStRegistro: 'A',
  };

  const mockPrazoNovo = {
    motivacaoPrazo: 'Nova motivação',
    qtdDiasLimiteRevisor: 7,
    qtdDiasLimiteAnalista: 4,
    idEtapa: 2,
    idPrioridade: 2,
    indStRegistro: 'I',
  };

  beforeEach(async () => {
    mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close', 'result']);
    mockModalRef.result = Promise.resolve(true);

    mockModalService = jasmine.createSpyObj('NgbModal', ['open']);
    mockModalService.open.and.returnValue(mockModalRef);

    await TestBed.configureTestingModule({
      declarations: [EtpPrazoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: NgbModal, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EtpPrazoComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Inicialização do Componente', () => {
    it('deve inicializar com propriedades padrão', () => {
      expect(component.titulo).toBe('Incluir Prazo');
      expect(component.etapasList).toEqual([]);
      expect(component.prioridadesList).toEqual([]);
      expect(component.statusList).toEqual([
        { id: 'A', descricao: 'Ativo' },
        { id: 'I', descricao: 'Inativo' },
      ]);
    });

    it('deve ter EventEmitter enviarPrazo definido', () => {
      expect(component.enviarPrazo).toBeDefined();
      expect(component.enviarPrazo instanceof EventEmitter).toBeTruthy();
    });
  });

  describe('Método open', () => {
    it('deve abrir modal para incluir novo prazo', async () => {
      const result = component.open(null, mockEtapasList, mockPrioridadesList);

      expect(component.titulo).toBe('Incluir Prazo');
      expect(component.etapasList).toEqual(mockEtapasList);
      expect(component.prioridadesList).toEqual(mockPrioridadesList);
      expect(component.etpPrazo).toBeNull();
      expect(mockModalService.open).toHaveBeenCalled();

      await expectAsync(result).toBeResolvedTo(true);
    });

    it('deve abrir modal para alterar prazo existente', async () => {
      const result = component.open(
        mockPrazoExistente,
        mockEtapasList,
        mockPrioridadesList
      );

      expect(component.titulo).toBe('Alterar Prazo');
      expect(component.etpPrazo).toEqual(mockPrazoExistente);
      expect(component.etapasList).toEqual(mockEtapasList);
      expect(component.prioridadesList).toEqual(mockPrioridadesList);
      expect(mockModalService.open).toHaveBeenCalled();

      await expectAsync(result).toBeResolvedTo(true);
    });

    it('deve configurar o formulário corretamente para prazo existente', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);

      expect(component.prazoForm).toBeDefined();
      expect(component.prazoForm.get('motivacaoPrazo')?.value).toBe(
        mockPrazoExistente.motivacaoPrazo
      );
      expect(component.prazoForm.get('qtdDiasLimiteRevisor')?.value).toBe(
        mockPrazoExistente.qtdDiasLimiteRevisor
      );
      expect(component.prazoForm.get('qtdDiasLimiteAnalista')?.value).toBe(
        mockPrazoExistente.qtdDiasLimiteAnalista
      );
      expect(component.prazoForm.get('etapaId')?.value).toBe(1);
      expect(component.prazoForm.get('prioridadeId')?.value).toBe(1);
      expect(component.prazoForm.get('indStRegistro')?.value).toBe(
        mockPrazoExistente.indStRegistro
      );
    });

    it('deve configurar modal com opções corretas', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);

      expect(mockModalService.open).toHaveBeenCalledWith(
        component['modalContent'],
        {
          centered: true,
          backdrop: 'static',
          keyboard: false,
          fullscreen: false,
          windowClass: 'modal-largura-servidores',
        }
      );
    });
  });

  describe('Validações do Formulário', () => {
    beforeEach(() => {
      component.open(null, mockEtapasList, mockPrioridadesList);
    });

    it('deve exigir etapaId como obrigatório', () => {
      const etapaControl = component.prazoForm.get('etapaId');

      etapaControl?.setValue(null);
      expect(etapaControl?.valid).toBeFalsy();
      expect(etapaControl?.hasError('required')).toBeTruthy();

      etapaControl?.setValue(1);
      expect(etapaControl?.valid).toBeTruthy();
    });

    it('deve exigir prioridadeId como obrigatório', () => {
      const prioridadeControl = component.prazoForm.get('prioridadeId');

      prioridadeControl?.setValue(null);
      expect(prioridadeControl?.valid).toBeFalsy();
      expect(prioridadeControl?.hasError('required')).toBeTruthy();

      prioridadeControl?.setValue(1);
      expect(prioridadeControl?.valid).toBeTruthy();
    });

    it('deve exigir indStRegistro como obrigatório', () => {
      const statusControl = component.prazoForm.get('indStRegistro');

      statusControl?.enable();

      statusControl?.setValue(null);
      expect(statusControl?.valid).toBeFalse();
      expect(statusControl?.hasError('required')).toBeTrue();

      statusControl?.setValue('A');
      expect(statusControl?.valid).toBeTrue();
    });

    it('deve exigir campos obrigatórios motivacaoPrazo, qtdDiasLimiteRevisor e qtdDiasLimiteAnalista', () => {
      const motivacaoControl = component.prazoForm.get('motivacaoPrazo');
      const revisorControl = component.prazoForm.get('qtdDiasLimiteRevisor');
      const analistaControl = component.prazoForm.get('qtdDiasLimiteAnalista');

      motivacaoControl?.setValue(null);
      revisorControl?.setValue(null);
      analistaControl?.setValue(null);

      expect(motivacaoControl?.valid).toBeFalse();
      expect(revisorControl?.valid).toBeFalse();
      expect(analistaControl?.valid).toBeFalse();

      motivacaoControl?.setValue('Teste');
      revisorControl?.setValue(5);
      analistaControl?.setValue(3);

      expect(motivacaoControl?.valid).toBeTrue();
      expect(revisorControl?.valid).toBeTrue();
      expect(analistaControl?.valid).toBeTrue();
    });

    it('deve definir botaoInativar como true quando indStRegistro é "I"', () => {
      const prazoInativo = {
        ...mockPrazoExistente,
        indStRegistro: 'I',
      };
      component.open(prazoInativo, mockEtapasList, mockPrioridadesList);
      expect(component.botaoInativar).toBeTrue();
    });

    it('deve ativar/inativar prazo chamando enviarPrazoSelecionado', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);
      spyOn(component, 'enviarPrazoSelecionado');

      component.ativarInativarPrazo('I');
      expect(component.prazoForm.get('indStRegistro')?.value).toBe('I');
      expect(component.enviarPrazoSelecionado).toHaveBeenCalled();
    });
  });

  describe('Método enviarPrazoSelecionado', () => {
    beforeEach(() => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);
      spyOn(component.enviarPrazo, 'emit');
      spyOn(component, 'close');
    });

    it('deve emitir dados do formulário corretamente', () => {
      component.prazoForm.patchValue({
        motivacaoPrazo: 'Nova motivação',
        qtdDiasLimiteRevisor: 10,
        qtdDiasLimiteAnalista: 5,
        etapaId: 2,
        prioridadeId: 2,
        indStRegistro: 'I',
      });

      component.enviarPrazoSelecionado();

      expect(component.enviarPrazo.emit).toHaveBeenCalledWith({
        motivacaoPrazo: 'Nova motivação',
        prazoId: mockPrazoExistente.id,
        prioridade: 2,
        etapa: 2,
        qtdDiasLimiteAnalista: 5,
        qtdDiasLimiteRevisor: 10,
        indStRegistro: 'I',
      });
    });

    it('deve chamar close após emitir dados', () => {
      component.enviarPrazoSelecionado();

      expect(component.close).toHaveBeenCalled();
    });

    it('deve usar valores atuais do formulário', () => {
      const novosValores = {
        motivacaoPrazo: 'Motivação atualizada',
        qtdDiasLimiteRevisor: 15,
        qtdDiasLimiteAnalista: 8,
        etapaId: 1,
        prioridadeId: 1,
        indStRegistro: 'A',
      };

      component.prazoForm.patchValue(novosValores);
      component.enviarPrazoSelecionado();

      expect(component.enviarPrazo.emit).toHaveBeenCalledWith({
        motivacaoPrazo: novosValores.motivacaoPrazo,
        prazoId: mockPrazoExistente.id,
        prioridade: novosValores.prioridadeId,
        etapa: novosValores.etapaId,
        qtdDiasLimiteAnalista: novosValores.qtdDiasLimiteAnalista,
        qtdDiasLimiteRevisor: novosValores.qtdDiasLimiteRevisor,
        indStRegistro: novosValores.indStRegistro,
      });
    });
  });

  describe('Getter formControl', () => {
    it('deve retornar controles do formulário quando formulário existe', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);

      const controls = component.formControl;

      expect(controls).toBeDefined();
      expect(controls['motivacaoPrazo']).toBeDefined();
      expect(controls['qtdDiasLimiteRevisor']).toBeDefined();
      expect(controls['qtdDiasLimiteAnalista']).toBeDefined();
      expect(controls['etapaId']).toBeDefined();
      expect(controls['prioridadeId']).toBeDefined();
      expect(controls['indStRegistro']).toBeDefined();
    });

    it('deve permitir acesso aos valores dos controles', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);

      expect(component.formControl['motivacaoPrazo'].value).toBe(
        mockPrazoExistente.motivacaoPrazo
      );
      expect(component.formControl['qtdDiasLimiteRevisor'].value).toBe(
        mockPrazoExistente.qtdDiasLimiteRevisor
      );
    });
  });

  describe('Método close', () => {
    it('deve resetar formulário e fechar modal quando modalRef existe', () => {
      component.open(mockPrazoExistente, mockEtapasList, mockPrioridadesList);
      spyOn(component.prazoForm, 'reset');

      component.close();

      expect(component.prazoForm.reset).toHaveBeenCalled();
      expect(mockModalRef.close).toHaveBeenCalled();
    });

    it('deve funcionar mesmo quando modalRef não existe', () => {
      component.modalRef = undefined as any;

      expect(() => component.close()).not.toThrow();
    });
  });

  describe('Integração e Fluxo Completo', () => {
    it('deve executar fluxo completo para alteração de prazo', async () => {
      spyOn(component.enviarPrazo, 'emit');

      const openPromise = component.open(
        mockPrazoExistente,
        mockEtapasList,
        mockPrioridadesList
      );

      expect(component.titulo).toBe('Alterar Prazo');

      component.prazoForm.patchValue({
        motivacaoPrazo: 'Teste alteração',
        qtdDiasLimiteRevisor: 12,
      });

      expect(component.prazoForm.valid).toBeTruthy();

      component.enviarPrazoSelecionado();

      expect(component.enviarPrazo.emit).toHaveBeenCalledWith({
        motivacaoPrazo: 'Teste alteração',
        prazoId: mockPrazoExistente.id,
        prioridade: 1,
        etapa: 1,
        qtdDiasLimiteAnalista: mockPrazoExistente.qtdDiasLimiteAnalista,
        qtdDiasLimiteRevisor: 12,
        indStRegistro: mockPrazoExistente.indStRegistro,
      });

      await expectAsync(openPromise).toBeResolvedTo(true);
    });

    it('deve lidar com listas vazias', () => {
      expect(() => component.open(mockPrazoExistente, [], [])).not.toThrow();

      expect(component.etapasList).toEqual([]);
      expect(component.prioridadesList).toEqual([]);
    });
  });

  describe('Cenários de Erro', () => {
    it('deve lidar com formulário inválido', () => {
      component.open(null, mockEtapasList, mockPrioridadesList);
      spyOn(component.enviarPrazo, 'emit');

      component.prazoForm.patchValue({
        etapaId: null,
        prioridadeId: null,
        indStRegistro: null,
      });

      expect(component.prazoForm.valid).toBeFalsy();

      component.enviarPrazoSelecionado();

      expect(component.enviarPrazo.emit).toHaveBeenCalled();
    });
  });
});

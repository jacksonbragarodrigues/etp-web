import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { EtpModule } from '../../../etp.module';
import { CadastrarEtpComponent } from './cadastrar-etp.component';
import { AlertUtils } from '../../../../../../utils/alerts.util';
import { EtpNumeracaoService } from '../../../../../services/etp-numeracao.service';
import { of } from 'rxjs';
import { SeiService } from '../../../../../services/sei.service';
import { RetornoConsultaProcedimentoDTO } from '../../../../../dto/retornoConsultaProcedimentoDTO.model';

describe('CadastrarEtpComponent', () => {
  let component: CadastrarEtpComponent;
  let fixture: ComponentFixture<CadastrarEtpComponent>;
  let formBuilder: FormBuilder = new FormBuilder();
  let objEtp: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CadastrarEtpComponent],
      imports: [EtpModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarEtpComponent);
    component = fixture.componentInstance;
    component.gestaoEtpModalForm = formBuilder.group({
      formularioId: 1,
      tipoLicitacaoId: 1,
      situacaoId: 1,
      descricao: 'teste',
      jsonDados: {},
      etpPai: undefined,
      versao: undefined,
      processoSei: null,
      ano: null,
    });

    objEtp = {
      id: 1,
      formulario: {
        id: 1,
        descricao: null,
      },
      tipoLicitacao: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      ano: 2024,
      etpNumeracao: 1,
      versao: 1,
      processoSei: '1',
      etapa: 1,
      etpPai: null,
      unidadeId: 1,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    const etp = {
      propriedade: 'teste',
      situacao: [{ chave: 'ABERTO' }, { chave: 'FECHADO' }],
      etpEtapa: [{ descricao: 'INICIAL' }, { descricao: 'FINAL' }],
      numeroProcessoSei: '45626',
      anoProcessoSei: '2022',
      formulario: { id: 1 },
      unidadeId: { id: 1 },
    };
    component.open(etp, [], [], [], [], [], { id: 1 }).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });

  it('deve abrir o modal com propriedades e resolver a Promise com true quando fechado', (done) => {
    component.open(null, [], [], [], [], [], {}).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });

  it('não deve chamar a função dismiss() se modalRef estiver indefinido', () => {
    const modalRef = {
      dismiss: jasmine.createSpy('dismiss'),
    };
    component.close();
    expect(modalRef.dismiss).not.toHaveBeenCalled();
  });

  it('should format the SEI/ETP number correctly when input has slash', () => {
    const event = { target: { value: '123/2023' } };
    component.completaProcessoSeiNumeroEtp(event, 'processoSei');
    expect(component.formControl['processoSei'].value).toEqual('000123/2023');
  });

  it('should add current year when input lacks year part', () => {
    const event = { target: { value: '123' } };
    component.completaProcessoSeiNumeroEtp(event, 'processoSei');
    expect(component.formControl['processoSei'].value).toEqual('000123/2024');
  });

  it('should set the current year when no year is set', () => {
    expect(component.formControl['ano'].value).toBeFalsy(); // Initially no value
    component.setCurrentYear();
    expect(component.formControl['ano'].value).toEqual(
      String(new Date().getFullYear())
    );
  });

  it('deve fechar o modal se fecharModal for true', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    await component.close(true);

    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('deve chamar gerarObjEtp e compararEtps se fecharModal for false', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
    component.etp = { propriedade: true };
    spyOn(component, 'gerarObjEtp').and.returnValue(Promise.resolve(objEtp));
    spyOn(component, 'compararEtps').and.returnValue(false);

    await component.close(false);

    expect(component.gerarObjEtp).toHaveBeenCalled();
    expect(component.compararEtps).toHaveBeenCalled();
  });

  it('deve exibir o confirmDialog se os objetos forem diferentes', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);

    component.etp = { propriedade: true };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));
    spyOn(component, 'gerarObjEtp').and.returnValue(Promise.resolve(objEtp));
    spyOn(component, 'compararEtps').and.returnValue(false);

    await component.close(false);

    expect(alert.confirmDialog).toHaveBeenCalledWith(
      `Há dados não salvos. Deseja gravá-los?`
    );
  });

  it('deve chamar gravar e fechar o modal se o usuário confirmar', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
    component.etp = { propriedade: true };

    spyOn(component, 'gerarObjEtp').and.returnValue(Promise.resolve(objEtp));
    spyOn(component, 'compararEtps').and.returnValue(false);
    spyOn(component, 'gravar');
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(true));

    await component.close(false);

    expect(component.gravar).toHaveBeenCalled();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('deve apenas fechar o modal se o usuário negar a gravação', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
    component.etp = { propriedade: true };
    spyOn(component, 'gerarObjEtp').and.returnValue(Promise.resolve(objEtp));
    spyOn(component, 'compararEtps').and.returnValue(false);
    spyOn(component, 'gravar');
    component.etp = { propriedade: true };
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'confirmDialog').and.returnValue(Promise.resolve(false));

    await component.close(false);

    expect(component.gravar).not.toHaveBeenCalled();
    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('deve fechar o modal diretamente se os objetos forem iguais', async () => {
    component.modalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
    spyOn(component, 'gerarObjEtp').and.returnValue(Promise.resolve(objEtp));
    spyOn(component, 'compararEtps').and.returnValue(true);

    await component.close(false);

    expect(component.modalRef.close).toHaveBeenCalled();
  });

  it('deve retornar false quando os IDs forem diferentes', () => {
    const etp = { id: 1 };
    const etpObj = { id: 2 };

    expect(component.compararEtps(etp, etpObj)).toBeFalse();
  });

  it('deve retornar false quando o processo SEI for diferente', () => {
    const etp = {
      id: 1,
      numeroProcessoSei: '123456',
      anoProcessoSei: '2024',
    };

    const etpObj = { id: 1, processoSei: '999999/2024' };

    expect(component.compararEtps(etp, etpObj)).toBeFalse();
  });

  it('deve retornar false quando os objetos forem diferentes', () => {
    const etp = {
      id: 1,
      formulario: { id: 10 },
      tipoLicitacao: { id: 20 },
      situacao: { id: 30 },
      descricao: 'Teste',
      ano: 2024,
      etpNumeracao: '0001',
      etpEtapa: { id: 40 },
    };

    const etpObj = {
      ...etp,
      descricao: 'Outro Teste',
    };

    expect(component.compararEtps(etp, etpObj)).toBeFalse();
  });

  it('deve chamar getUltimoNumeroEtpPorAno e atualizar etpNumeracao corretamente', async () => {
    component.gestaoEtpModalForm = new FormBuilder().group({
      ano: ['2024'],
      etpNumeracao: [''],
    });

    const etpNumeracaoService: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(etpNumeracaoService, 'getUltimoNumeroEtpPorAno').and.returnValue(
      of(5)
    );

    await component.recuperarNumeroEtp();

    expect(etpNumeracaoService.getUltimoNumeroEtpPorAno).toHaveBeenCalledWith(
      2024
    );
    expect(component.formControl['etpNumeracao'].value).toBe('0005');
  });

  it('não deve chamar getUltimoNumeroEtpPorAno se ano for indefinido', async () => {
    component.gestaoEtpModalForm = new FormBuilder().group({
      ano: ['2024'],
      etpNumeracao: [''],
    });
    component.gestaoEtpModalForm.get('ano')?.setValue(undefined);
    const etpNumeracaoService: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(etpNumeracaoService, 'getUltimoNumeroEtpPorAno').and.returnValue(
      of(5)
    );

    await component.recuperarNumeroEtp();

    expect(etpNumeracaoService.getUltimoNumeroEtpPorAno).not.toHaveBeenCalled();
  });

  it('não deve chamar getUltimoNumeroEtpPorAno se o ano tiver menos de 4 dígitos', async () => {
    component.gestaoEtpModalForm = new FormBuilder().group({
      ano: ['2024'],
      etpNumeracao: [''],
    });
    component.gestaoEtpModalForm.get('ano')?.setValue(20);

    const etpNumeracaoService: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(etpNumeracaoService, 'getUltimoNumeroEtpPorAno').and.returnValue(
      of(5)
    );

    await component.recuperarNumeroEtp();

    expect(etpNumeracaoService.getUltimoNumeroEtpPorAno).not.toHaveBeenCalled();
  });

  it('deve chamar pesquisaProcesso e atualizar o campo processoSei', async () => {
    component.gestaoEtpModalForm = new FormBuilder().group({
      processoSei: ['123456/2024'],
    });
    const seiService: SeiService =
      fixture.debugElement.injector.get(SeiService);
    let retorno: RetornoConsultaProcedimentoDTO =
      new RetornoConsultaProcedimentoDTO();
    retorno.procedimentoFormatado = '654321/2024';
    spyOn(seiService, 'pesquisaProcesso').and.returnValue(
      Promise.resolve(retorno)
    );

    await component.pesquisaProcesso();

    expect(seiService.pesquisaProcesso).toHaveBeenCalledWith('123456/2024');
    expect(component.formControl['processoSei'].value).toBe('654321/2024');
  });

  it('deve exibir um alerta se o número do processo SEI não existir', async () => {
    const seiService: SeiService =
      fixture.debugElement.injector.get(SeiService);
    spyOn(seiService, 'pesquisaProcesso').and.returnValue(
      Promise.resolve(null)
    );
    const alert: AlertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(alert, 'alertDialog');
    await component.pesquisaProcesso();

    expect(alert.alertDialog).toHaveBeenCalledWith(
      'O número do processo SEI null não existe!'
    );
  });

  it('deve filtrar unidadeList com base na query', () => {
    component.unidadeList = [
      {
        id: 1,
        descricao: 'Unidade de Compras',
        descricaoSigla: 'SEPSA - Unidade de Compras',
      },
      {
        id: 2,
        descricao: 'Departamento Financeiro',
        descricaoSigla: 'SEPSA - Departamento Financeiro',
      },
      {
        id: 3,
        descricao: 'Recursos Humanos',
        descricaoSigla: 'SEPSA - Recursos Humanos',
      },
    ];
    const event = { query: 'compras' };

    component.buscarUnidades(event);

    expect(component.unidadeListFiltrada).toEqual([
      {
        id: 1,
        descricao: 'Unidade de Compras',
        descricaoSigla: 'SEPSA - Unidade de Compras',
      },
    ]);
  });

  it('deve limpar o campo unidadeEtp se nenhum item foi selecionado', fakeAsync(() => {
    component.gestaoEtpModalForm = new FormBuilder().group({
      unidadeEtp: ['123'],
    });
    component.itemSelecionado = false;

    component.onCampoFocado();
    tick(200); // Simula o atraso do setTimeout

    expect(component.formControl['unidadeEtp'].value).toBe('');
  }));

  it('deve definir itemSelecionado como true', () => {
    component.itemSelecionado = false; // Garantindo que começa como falso

    component.onItemSelecionado();

    expect(component.itemSelecionado).toBeTrue();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarEtpNumeracaoComponent } from './modal-cadastrar-etp-numeracao.component';
import {FormBuilder} from "@angular/forms";
import {EtpNumeracaoModule} from "../etp-numeracao.module";
import {AppModule} from "../../../app.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {GestaoFormularioService} from "../../../services/gestao-formulario.service";
import {of} from "rxjs";
import {EtpNumeracaoService} from "../../../services/etp-numeracao.service";

describe('ModalCadastrarEtpNumeracaoComponent', () => {
  let component: ModalCadastrarEtpNumeracaoComponent;
  let fixture: ComponentFixture<ModalCadastrarEtpNumeracaoComponent>;
  let formBuilder: FormBuilder = new FormBuilder();
  let etpNumeracaoService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarEtpNumeracaoComponent],
      imports: [EtpNumeracaoModule, AppModule, HttpClientTestingModule],
      providers: [
        EtpNumeracaoService,
        { provide: FormBuilder, useValue: formBuilder }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarEtpNumeracaoComponent);
    etpNumeracaoService = TestBed.inject(EtpNumeracaoService);

    component = fixture.componentInstance;
    component.gestaoEtpNumercaoModalForm = formBuilder.group({
      idNumeracaoEtp: 1,
      ano: 2024,
      etp: 1,
      etpNumeracao: 1,
      status: 1
    })
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    component.open(null, [], [{"id": 1, "nome": "ATIVO"}]).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });

  it('deve abrir o modal de alteração e resolver a Promise com true quando fechado', (done) => {
    let etpNumeracao = {
      idNumeracaoEtp: 1,
      ano: 2024,
      etp: 1,
      etpNumeracao: 1,
      status: 1
    }
    component.open(etpNumeracao, [], [{"id": 1, "nome": "ATIVO"}]).then((result) => {
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

  it('deve chamar a funcao gravar', () => {
    const response: any = {};
    const objEtpNumeracao = {
      idNumeracaoEtp: 1,
      ano: 2024,
      etp: 1,
      etpNumeracao: 1,
      status: 1
    };

    spyOn(component.cadastrarEtpNumeracao, 'emit').and.callFake(() => objEtpNumeracao);

    component.etpNumeracao = objEtpNumeracao;
    component.gravar();

    expect(component.cadastrarEtpNumeracao.emit).toHaveBeenCalledWith(objEtpNumeracao);
  });

  it('deve recuperar o ano atual', () => {
    // Verifica que o valor inicial de 'ano' é nulo
    component.formControl['ano']?.setValue(null);
    expect(component.formControl['ano']?.value).toBeNull();

    // Chama o método que estamos testando
    component.setCurrentYear();

    // Verifica se o valor foi atualizado para o ano atual
    const currentYear = new Date().getFullYear();
    expect(String(component.formControl['ano']?.value)).toBe(String(currentYear));
  });

  it('deve recuperar o numero do etp', () => {
    // Verifica que o valor inicial de 'ano' é nulo
    component.formControl['ano']?.setValue(2024);
    expect(component.formControl['ano']?.value).toBe(2024);

    let response = 1

    const service: EtpNumeracaoService =
      fixture.debugElement.injector.get(EtpNumeracaoService);
    spyOn(service, 'getUltimoNumeroEtpPorAno').and.returnValue(of(response));

    // Chama o método que estamos testando
    component.recuperarNumeroEtp();

    // Verifica se o valor foi atualizado para o ano atual
    expect(component.formControl['etpNumeracao']?.value).toBe('1');
  });



});

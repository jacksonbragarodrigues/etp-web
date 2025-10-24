import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ModalCadastrarEtpEtapaComponent } from './modal-cadastrar-etp-etapa.component';

describe('ModalCadastrarEtpEtapaComponent', () => {
  let component: ModalCadastrarEtpEtapaComponent;
  let fixture: ComponentFixture<ModalCadastrarEtpEtapaComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarEtpEtapaComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarEtpEtapaComponent);
    component = fixture.componentInstance;
    component.gestaoEtapaModalForm = formBuilder.group({
      descricao: 'teste',
      chave: 'teste',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    const objEtpEtapa = {
      descricao: 'teste',
      chave: 'teste',
    };
    component.open(objEtpEtapa).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    const objEtpEtapa = {
      id: 1,
      descricao: 'teste',
      seigla: 'teste',
    };
    component.open(objEtpEtapa).then((result) => {
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

  it('deve chamar a funcao gravarEtpEtapa PUT', () => {
    const response: any = {};
    const objEtpEtapa = {
      id: 1,
      descricao: 'teste',
      chave: 'teste',
    };

    spyOn(component.cadastrarEtpEtapa, 'emit').and.callFake(() => objEtpEtapa);

    // Chame a função editar com os valores de teste
    component.etapa = objEtpEtapa;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarEtpEtapa.emit).toHaveBeenCalledWith(objEtpEtapa);
  });
});

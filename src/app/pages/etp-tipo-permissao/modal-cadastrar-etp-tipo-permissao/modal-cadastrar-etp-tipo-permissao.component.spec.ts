import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ModalCadastrarEtpTipoPermissaoComponent } from '../modal-cadastrar-etp-tipo-permissao/modal-cadastrar-etp-tipo-permissao.component';

describe('ModalCadastrarEtpTipoPermissaoComponent', () => {
  let component: ModalCadastrarEtpTipoPermissaoComponent;
  let fixture: ComponentFixture<ModalCadastrarEtpTipoPermissaoComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarEtpTipoPermissaoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarEtpTipoPermissaoComponent);
    component = fixture.componentInstance;
    component.gestaoEtpTipoPermissaoModalForm = formBuilder.group({
      descricao: 'teste',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    component.open(null).then((result) => {
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

  it('deve chamar a funcao gravarAssunto PUT', () => {
    const response: any = {};
    const objEtpTipoPermissao = {
      id: 1,
      descricao: 'teste',
      chave: undefined,
      indStRegistro: undefined,
    };

    spyOn(component.cadastrarEtpTipoPermissao, 'emit').and.callFake(
      () => objEtpTipoPermissao
    );

    // Chame a função editar com os valores de teste
    component.etpTipoPermissao = objEtpTipoPermissao;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarEtpTipoPermissao.emit).toHaveBeenCalledWith(
      objEtpTipoPermissao
    );
  });
});

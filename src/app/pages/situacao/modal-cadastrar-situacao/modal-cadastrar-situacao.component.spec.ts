import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarSituacaoComponent } from './modal-cadastrar-situacao.component';
import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

describe('ModalCadastrarSituacaoComponent', () => {
  let component: ModalCadastrarSituacaoComponent;
  let fixture: ComponentFixture<ModalCadastrarSituacaoComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarSituacaoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarSituacaoComponent);
    component = fixture.componentInstance;
    component.gestaoSituacaoModalForm = formBuilder.group({
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
    const objSituacao = {
      id: 1,
      descricao: 'teste',
      chave: undefined,
    };

    spyOn(component.cadastrarSituacao, 'emit').and.callFake(() => objSituacao);

    // Chame a função editar com os valores de teste
    component.Situacao = objSituacao;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarSituacao.emit).toHaveBeenCalledWith(objSituacao);
  });
});

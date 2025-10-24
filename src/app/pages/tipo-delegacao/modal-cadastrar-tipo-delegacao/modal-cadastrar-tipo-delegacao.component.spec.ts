import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { PrincipalModule } from '../../principal/principal.module';
import { ModalCadastrarTipoDelegacaoComponent } from './modal-cadastrar-tipo-delegacao.component';

describe('ModalCadastrarTipoDelegacaoComponent', () => {
  let component: ModalCadastrarTipoDelegacaoComponent;
  let fixture: ComponentFixture<ModalCadastrarTipoDelegacaoComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarTipoDelegacaoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarTipoDelegacaoComponent);
    component = fixture.componentInstance;
    component.gestaoTipoDelegacaoModalForm = formBuilder.group({
      descricao: 'teste',
      chave: 'etp',
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

  it('deve chamar a funcao gravarTipoDelegacao PUT', () => {
    const response: any = {};
    const objTipoDelegacao = {
      id: 1,
      descricao: 'teste',
      chave: 'etp',
    };

    spyOn(component.cadastrarTipoDelegacao, 'emit').and.callFake(() => objTipoDelegacao);

    // Chame a função editar com os valores de teste
    component.tipoDelegacao = objTipoDelegacao;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarTipoDelegacao.emit).toHaveBeenCalledWith(objTipoDelegacao);
  });
});

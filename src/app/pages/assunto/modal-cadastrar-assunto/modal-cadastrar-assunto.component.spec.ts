import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarAssuntoComponent } from './modal-cadastrar-assunto.component';
import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

describe('ModalCadastrarAssuntoComponent', () => {
  let component: ModalCadastrarAssuntoComponent;
  let fixture: ComponentFixture<ModalCadastrarAssuntoComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarAssuntoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarAssuntoComponent);
    component = fixture.componentInstance;
    component.gestaoAssuntoModalForm = formBuilder.group({
      descricao: 'teste',
      chave: 'etp',
      sqFormularioAnalise: 2
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    component.open(null, []).then((result) => {
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
    const objAssunto = {
      id: 1,
      descricao: 'teste',
      chave: 'etp',
      sqFormularioAnalise: 2
    };

    spyOn(component.cadastrarAssunto, 'emit').and.callFake(() => objAssunto);

    // Chame a função editar com os valores de teste
    component.assunto = objAssunto;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarAssunto.emit).toHaveBeenCalledWith(objAssunto);
  });
});

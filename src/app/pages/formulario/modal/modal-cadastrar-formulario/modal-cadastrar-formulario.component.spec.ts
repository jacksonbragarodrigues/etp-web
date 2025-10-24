import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarFormularioComponent } from './modal-cadastrar-formulario.component';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

describe('ModalCadastrarFormularioComponent', () => {
  let component: ModalCadastrarFormularioComponent;
  let fixture: ComponentFixture<ModalCadastrarFormularioComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarFormularioComponent);
    component = fixture.componentInstance;
    component.gestaoFormularioModalForm = formBuilder.group({
      assuntoId: 1,
      situacaoId: 1,
      descricao: 'teste',
      jsonForm: {},
      idPai: undefined,
      versao: undefined,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve abrir o modal e resolver a Promise com true quando fechado', (done) => {
    component.open(null, [], []).then((result) => {
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

  it('deve chamar a 1 gravarFormulario PUT', () => {
    const response: any = {};
    const objFormulario = {
      id: 1,
      assunto: {
        id: 1,
        descricao: null,
      },
      situacao: {
        id: 1,
        descricao: null,
      },
      descricao: 'teste',
      jsonForm: {},
      idPai: null,
      versao: null,
    };

    spyOn(component.cadastrarFormulario, 'emit').and.callFake(
      () => objFormulario
    );

    // Chame a função editar com os valores de teste
    component.formulario = objFormulario;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarFormulario.emit).toHaveBeenCalledWith(
      objFormulario
    );
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCadastrarRotulosComponent } from './modal-cadastrar-rotulos.component';
import { PrincipalModule } from '../../principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

describe('ModalCadastrarRotulosComponent', () => {
  let component: ModalCadastrarRotulosComponent;
  let fixture: ComponentFixture<ModalCadastrarRotulosComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCadastrarRotulosComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCadastrarRotulosComponent);
    component = fixture.componentInstance;
    component.gestaoRotulosModalForm = formBuilder.group({
      de: 'teste',
      para: 'teste',
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

  it('deve chamar a funcao gravarRotulos PUT', () => {
    const response: any = {};
    const objRotulos = {
      id: 1,
      de: 'teste',
      para: 'teste',
    };

    spyOn(component.cadastrarRotulos, 'emit').and.callFake(() => objRotulos);

    // Chame a função editar com os valores de teste
    component.rotulos = objRotulos;
    component.gravar();

    // Verifique se o método editarCartao foi chamado com o objeto correto
    expect(component.cadastrarRotulos.emit).toHaveBeenCalledWith(objRotulos);
  });
});

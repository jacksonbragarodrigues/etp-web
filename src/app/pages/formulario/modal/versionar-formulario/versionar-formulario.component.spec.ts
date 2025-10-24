import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { VersionarFormularioComponent } from './versionar-formulario.component';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';

describe('CadastrarEtpComponent', () => {
  let component: VersionarFormularioComponent;
  let fixture: ComponentFixture<VersionarFormularioComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VersionarFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionarFormularioComponent);
    component = fixture.componentInstance;
    component.gestaoVersaoFormularioModalForm = formBuilder.group({
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
    component.closeFormulario();
    expect(modalRef.dismiss).not.toHaveBeenCalled();
  });

  it('should execute versioning and close the modal', () => {
    const mockFormuulario = { motivo: 'Initial Motive' };
    const mockExecutaVersionarGestao = jasmine.createSpy(
      'executaVersionarGestao'
    );
    component.executaVersionarFormularioGestao = mockExecutaVersionarGestao;
    component.open(mockFormuulario);
    component.gestaoVersaoFormularioModalForm
      .get('descricao')
      ?.setValue('Updated Motive');

    component.executaVersionarFormulario();

    expect(mockExecutaVersionarGestao).toHaveBeenCalledWith({
      ...mockFormuulario,
      motivo: 'Updated Motive',
    });
  });
});

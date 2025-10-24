import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { AppModule } from 'src/app/app.module';
import { EtpModule } from '../../../etp.module';
import { VersionarComponent } from './versionar.component';

describe('CadastrarEtpComponent', () => {
  let component: VersionarComponent;
  let fixture: ComponentFixture<VersionarComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VersionarComponent],
      imports: [EtpModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(VersionarComponent);
    component = fixture.componentInstance;
    component.gestaoVersaoModalForm = formBuilder.group({
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

  it('should execute versioning and close the modal', () => {
    const mockEtp = { motivo: 'Initial Motive' };
    const mockExecutaVersionarGestao = jasmine.createSpy(
      'executaVersionarGestao'
    );
    component.executaVersionarGestao = mockExecutaVersionarGestao;
    component.open(mockEtp);
    component.gestaoVersaoModalForm
      .get('descricao')
      ?.setValue('Updated Motive');

    component.executaVersionar();

    expect(mockExecutaVersionarGestao).toHaveBeenCalledWith({
      ...mockEtp,
      motivo: 'Updated Motive',
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMensageComponent } from './error-mensage.component';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';

describe('ErrorMensageComponent', () => {
  let component: ErrorMensageComponent;
  let fixture: ComponentFixture<ErrorMensageComponent>;
  let formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorMensageComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: FormBuilder, useValue: formBuilder }],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorMensageComponent);
    component = fixture.componentInstance;
    component.form = formBuilder.group({
      descricao: 'teste',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

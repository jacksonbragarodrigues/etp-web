import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PesquisarSharedFormularioComponent } from './pesquisar-shared-formulario.component';

describe('ErrorMensageComponent', () => {
  let component: PesquisarSharedFormularioComponent;
  let fixture: ComponentFixture<PesquisarSharedFormularioComponent>;
  let mockTableLazyLoadingPai: jasmine.Spy;
  let mockLimparCamposPai: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PesquisarSharedFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PesquisarSharedFormularioComponent);
    component = fixture.componentInstance;
    mockTableLazyLoadingPai = jasmine.createSpy('tableLazyLoadingPai');
    mockLimparCamposPai = jasmine.createSpy('limparCamposPai');

    // Atribuindo os espiões aos inputs do componente
    component.tableLazyLoadingPai = mockTableLazyLoadingPai;
    component.limparCamposPai = mockLimparCamposPai;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.tableLazyLoading();
    expect(mockTableLazyLoadingPai).toHaveBeenCalled();
  });

  it('should call limparCamposPai when limparCampos is called', () => {
    component.limparCampos();
    expect(mockLimparCamposPai).toHaveBeenCalled();
  });
});

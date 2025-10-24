import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TableSharedFormularioComponent } from './table-shared-formulario.component';
import GestaoBase from 'src/app/pages/shared/gestao-base';

describe('ErrorMensageComponent', () => {
  let component: TableSharedFormularioComponent;
  let fixture: ComponentFixture<TableSharedFormularioComponent>;
  let mockTableLazyLoadingPai: jasmine.Spy;
  let mockTableOnSortPai: jasmine.Spy;
  let mockEditarPai: jasmine.Spy;
  let mockExcluirPai: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableSharedFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(TableSharedFormularioComponent);
    component = fixture.componentInstance;
    mockTableLazyLoadingPai = jasmine.createSpy('tableLazyLoadingPai');
    mockTableOnSortPai = jasmine.createSpy('onSortPai');
    mockEditarPai = jasmine.createSpy('editarPai');
    mockExcluirPai = jasmine.createSpy('excluirPai');

    // Atribuindo os espiões aos inputs do componente
    component.tableLazyLoadingPai = mockTableLazyLoadingPai;
    component.onSortPai = mockTableOnSortPai;
    component.editarPai = mockEditarPai;
    component.excluirPai = mockExcluirPai;
    component.gestaoBase = new GestaoBase();
    component.page = {
      content: [
        {
          id: 1,
          descricao: 'teste',
          dataModificacao: new Date(),
          usuarioModificacao: 'teste',
        },
      ],
      empty: false,
      first: false,
      last: false,
      number: 1,
      numberOfElements: 1,
      pageable: null,
      size: 10,
      sort: null,
      totalElements: 1,
      totalPages: 1,
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.tableLazyLoading({});
    expect(mockTableLazyLoadingPai).toHaveBeenCalled();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.onSort({});
    expect(mockTableOnSortPai).toHaveBeenCalled();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.editar({});
    expect(mockEditarPai).toHaveBeenCalled();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.excluir({});
    expect(mockExcluirPai).toHaveBeenCalled();
  });
});

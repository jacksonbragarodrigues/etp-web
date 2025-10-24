import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OverlayPanelModule } from "primeng/overlaypanel";
import { PanelMenuModule } from "primeng/panelmenu";
import GestaoBase from 'src/app/pages/shared/gestao-base';
import {TableSharedFormComponent} from "./table-shared-form.component";

describe('TableSharedEtpComponent', () => {
  let component: TableSharedFormComponent;
  let fixture: ComponentFixture<TableSharedFormComponent>;
  let mockTableLazyLoadingPai: jasmine.Spy;
  let mockTableOnSortPai: jasmine.Spy;
  let mockConstruirFormulario: jasmine.Spy;
  let mockSelcionarFormulario: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableSharedFormComponent ],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule, OverlayPanelModule, PanelMenuModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(TableSharedFormComponent);
    component = fixture.componentInstance;
    mockTableLazyLoadingPai = jasmine.createSpy('tableLazyLoadingPai');
    mockTableOnSortPai = jasmine.createSpy('onSortPai');
    mockConstruirFormulario = jasmine.createSpy('construirFormulario');
    mockSelcionarFormulario = jasmine.createSpy('selecionarFormulario');

    // Atribuindo os espiões aos inputs do componente
    component.tableLazyLoadingPai = mockTableLazyLoadingPai;
    component.onSortPai = mockTableOnSortPai;
    component.construirFormulario = mockConstruirFormulario;
    component.selecionarFormulario = mockSelcionarFormulario;
    component.gestaoBase = new GestaoBase();
    component.page = {
      content: [

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
    component.selecionaForm({
      stopPropagation : () => {},
    }, {});
    expect(mockSelcionarFormulario).toHaveBeenCalled();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.construirForm({});
    expect(mockConstruirFormulario).toHaveBeenCalled();
  });
});

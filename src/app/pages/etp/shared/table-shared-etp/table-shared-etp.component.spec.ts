import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import GestaoBase from 'src/app/pages/shared/gestao-base';
import { TableSharedEtpComponent } from "./table-shared-etp.component";
import { RemoveZerosProcessoSeiPipe } from "../remove-zeros-processo-sei-pipe.pipe";
import {OverlayPanelModule} from "primeng/overlaypanel";
import {PanelMenuModule} from "primeng/panelmenu";


describe('TableSharedEtpComponent', () => {
  let component: TableSharedEtpComponent;
  let fixture: ComponentFixture<TableSharedEtpComponent>;
  let mockTableLazyLoadingPai: jasmine.Spy;
  let mockTableOnSortPai: jasmine.Spy;
  let mockElaborar: jasmine.Spy;
  let mockSelcionar: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableSharedEtpComponent , RemoveZerosProcessoSeiPipe],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule, OverlayPanelModule, PanelMenuModule],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(TableSharedEtpComponent);
    component = fixture.componentInstance;
    mockTableLazyLoadingPai = jasmine.createSpy('tableLazyLoadingPai');
    mockTableOnSortPai = jasmine.createSpy('onSortPai');
    mockElaborar = jasmine.createSpy('elaborar');
    mockSelcionar = jasmine.createSpy('selecionarEtp');

    // Atribuindo os espiões aos inputs do componente
    component.tableLazyLoadingPai = mockTableLazyLoadingPai;
    component.onSortPai = mockTableOnSortPai;
    component.elaborar = mockElaborar;
    component.selecionarEtp = mockSelcionar;
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
    component.selecionaItem({
      stopPropagation : () => {},
    }, {});
    expect(mockSelcionar).toHaveBeenCalled();
  });

  it('should call tableLazyLoadingPai when tableLazyLoading is called', () => {
    component.elaborarEtp({});
    expect(mockElaborar).toHaveBeenCalled();
  });
});

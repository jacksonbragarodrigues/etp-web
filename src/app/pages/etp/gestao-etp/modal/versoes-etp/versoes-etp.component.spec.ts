import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { VersoesEtpComponent } from './versoes-etp.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TabelaSortableHeader } from "../../../../../shared/tables/table-sortable";
import { QueryList } from '@angular/core';
import {
  ModalConstruirFormularioComponent
} from "../../../../formulario/modal/modal-construir-formulario/modal-construir-formulario.component";
import {PrincipalModule} from "../../../../principal/principal.module";
import {AppModule} from "../../../../../app.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AlertUtils} from "../../../../../../utils/alerts.util";
import {
  ModalVersoesFormularioComponent
} from "../../../../formulario/modal/modal-versoes-formulario/modal-versoes-formulario.component";

describe('VersoesEtpComponent', () => {
  let component: VersoesEtpComponent;
  let fixture: ComponentFixture<VersoesEtpComponent>;
  let modalService: NgbModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalConstruirFormularioComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [AlertUtils],
    }).compileComponents();

    fixture = TestBed.createComponent(VersoesEtpComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize page correctly', () => {
    component.iniciaPageVersoesEtp();
    expect(component.page.number).toBe(1);
    expect(component.page.size).toBe(10);
    expect(component.page.totalPages).toBe(0);
  });

  it('should open modal and set data correctly', (done) => {
    const etpList = [{ id: 1 }];
    const totalElements = 1;
    const descricao = 'Test Modal';

    const resultPromise = component.open(etpList, totalElements, descricao);
    component.open(etpList, totalElements, descricao).then((result) => {
      expect(result).toBeUndefined();
      done();
    });
    setTimeout(() => {
      component.modalRef.close();
    }, 1000);

  });

  it('should call tableLazyLoading correctly', () => {
    const etpList = [{ id: 1 , descricao: 'teste'}];
    const totalElements = 1;

    component.etpList = etpList;
    component.totalElements = totalElements;
    component.tableLazyLoading();

    expect(component.page.content).toEqual(etpList);
    expect(component.page.totalElements).toBe(totalElements);
  });

  it('should select an item', () => {
    const item = { id: 1 };
    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.selecionarItem(event, item);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.selectedRowData).toBe(item);
  });

  it('should emit elaborarEtp event', () => {
    spyOn(component.elaborarEtp, 'emit');
    const item = { id: 1 };

    component.construirEtp(item);

    expect(component.elaborarEtp.emit).toHaveBeenCalledWith(item);
  });

  it('should sort the table correctly', () => {
    const headers = [
      { sortable: 'coluna1', direcao: '' },
      { sortable: 'coluna2', direcao: '' }
    ] as TabelaSortableHeader[];
    const queryList = new QueryList<TabelaSortableHeader>();
    queryList.reset(headers);
    component.headers = queryList;

    const sortEvent = { coluna: 'coluna1', direcao: 'asc' };
    component.onSort(sortEvent);

    expect(component.page.sort).toBe('coluna1,asc');
    expect(component.headers.toArray()[0].direcao).toBe('asc');
    expect(component.headers.toArray()[1].direcao).toBe('');
  });

  it('should close the modal', () => {
    component.close();
  });

  it('should return correct modification data', () => {
    const item = { dataAlteracao: '2022-01-01', dataRegistro: '2021-01-01' };
    expect(component.gestaoBase.getDataModificacao(item)).toBe('2022-01-01');

    const itemWithoutAlteracao = { dataAlteracao: null, dataRegistro: '2021-01-01' };
    expect(component.gestaoBase.getDataModificacao(itemWithoutAlteracao)).toBe('2021-01-01');
  });

  it('should return correct modification user', () => {
    const item = { usuarioAlteracao: 'user2', usuarioRegistro: 'user1', dataAlteracao: '2022-01-01' };
    expect(component.gestaoBase.getUsuarioModificacao(item)).toBe('user2');

    const itemWithoutAlteracao = { usuarioAlteracao: null, usuarioRegistro: 'user1', dataAlteracao: null };
    expect(component.gestaoBase.getUsuarioModificacao(itemWithoutAlteracao)).toBe('user1');
  });
});

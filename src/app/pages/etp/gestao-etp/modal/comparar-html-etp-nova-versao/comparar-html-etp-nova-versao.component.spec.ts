import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';
import { of } from 'rxjs';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';
import { CompararHtmlEtpNovaVersaoComponent } from './comparar-html-etp-nova-versao.component';
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

describe('CompararHtmlEtpComponent', () => {
  let component: CompararHtmlEtpNovaVersaoComponent;
  let fixture: ComponentFixture<CompararHtmlEtpNovaVersaoComponent>;
  let compararHtmlservice: any;
  let gestaoEtpService: any;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let modalRefSpy: jasmine.SpyObj<NgbModalRef>;

  beforeEach(async () => {
    modalRefSpy = jasmine.createSpyObj('NgbModalRef', ['close']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalServiceSpy.open.and.returnValue(modalRefSpy);
    await TestBed.configureTestingModule({
      declarations: [CompararHtmlEtpNovaVersaoComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [CompararHtmlservice],
    }).compileComponents();

    fixture = TestBed.createComponent(CompararHtmlEtpNovaVersaoComponent);
    component = fixture.componentInstance;
    compararHtmlservice = TestBed.inject(CompararHtmlservice);
    gestaoEtpService = TestBed.inject(GestaoEtpService);
    component.versaoFinal = {
      id: 1,
    };
    component.versaoInicial = {
      id: 2,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compare html and sanitize the response', () => {
    const mockHtml = '<p>Modified HTML</p>';
    spyOn(compararHtmlservice, 'compararVersaoHtmlFormulario').and.returnValue(
      of({ html: mockHtml })
    );
    component.compararHtml();
    expect(compararHtmlservice.compararVersaoHtmlFormulario).toHaveBeenCalled();
  });

  it('should compare html and sanitize the response', () => {
    const mockHtml = '';
    spyOn(compararHtmlservice, 'compararVersaoHtmlFormulario').and.returnValue(
      of({ html: mockHtml })
    );
    component.compararHtml();
    expect(compararHtmlservice.compararVersaoHtmlFormulario).toHaveBeenCalled();
  });

  it('deve chamar cancelarNovaVersao com etp e chamar close', () => {
    const cancelarNovaVersaoSpy = jasmine.createSpy('cancelarNovaVersaoSpy');
    const closeSpy = spyOn(component, 'close');
    component.cancelarNovaVersao = cancelarNovaVersaoSpy;

    component.cancelarNovaVersaoHtml();

    expect(cancelarNovaVersaoSpy).toHaveBeenCalledWith(component.etp);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('não deve chamar cancelarNovaVersao se não estiver definido', () => {
    const closeSpy = spyOn(component, 'close');
    component.cancelarNovaVersao = undefined;

    component.cancelarNovaVersaoHtml();

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('deve chamar aceitarNovaVersao com etp e formulario e chamar close', () => {
    const aceitarNovaVersaoSpy = jasmine.createSpy('aceitarNovaVersaoSpy');
    const closeSpy = spyOn(component, 'close');
    component.aceitarNovaVersao = aceitarNovaVersaoSpy;

    component.aceitarNovaVersaoHtml();

    expect(aceitarNovaVersaoSpy).toHaveBeenCalledWith(component.etp, component.formulario);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('não deve chamar aceitarNovaVersao se não estiver definido', () => {
    const closeSpy = spyOn(component, 'close');
    component.aceitarNovaVersao = undefined;

    component.aceitarNovaVersaoHtml();

    expect(closeSpy).not.toHaveBeenCalled();
  });


  it('deve retornar a concatenação de descricao e versao em getLabel', () => {
    const descricao = 'Versão ';
    const versao = '1.0';
    const resultado = component.getLabel(descricao, versao);
    expect(resultado).toBe('Versão 1.0');
  });

  it('deve fechar o modal se modalRef estiver definido', () => {
    component.modalRef = modalRefSpy;
    component.close();
    expect(modalRefSpy.close).toHaveBeenCalled();
  });

});

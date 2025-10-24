import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';
import { of } from 'rxjs';
import { CompararHtmlEtpComponent } from './comparar-html-etp.component';
import { GestaoEtpService } from 'src/app/services/gestao-etp.service';

describe('CompararHtmlEtpComponent', () => {
  let component: CompararHtmlEtpComponent;
  let fixture: ComponentFixture<CompararHtmlEtpComponent>;
  let compararHtmlservice: any;
  let gestaoEtpService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompararHtmlEtpComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [CompararHtmlservice],
    }).compileComponents();

    fixture = TestBed.createComponent(CompararHtmlEtpComponent);
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

  it('should initialize lists correctly', () => {
    expect(component.listaVersoesInicialEtp.length).toBe(0);
    expect(component.listaVersoesFinalEtp.length).toBe(0);
  });

  it('should compare html and sanitize the response', () => {
    const mockHtml = '<p>Modified HTML</p>';
    spyOn(compararHtmlservice, 'compararVersaoHtmlEtp').and.returnValue(
      of({ html: mockHtml })
    );
    component.compararHtmlEtp();
    expect(compararHtmlservice.compararVersaoHtmlEtp).toHaveBeenCalled();
  });

  it('should compare html and sanitize the response', () => {
    const mockHtml = '';
    spyOn(compararHtmlservice, 'compararVersaoHtmlEtp').and.returnValue(
      of({ html: mockHtml })
    );
    component.compararHtmlEtp();
    expect(compararHtmlservice.compararVersaoHtmlEtp).toHaveBeenCalled();
  });

  it('should enable the compare button correctly', () => {
    component.versaoInicial = { id: 1 };
    component.versaoFinal = { id: 2 };
    component.listaVersoesFinalEtp = [];
    fixture.detectChanges();
    expect(component.habilitarBotaoCompararEtp()).toBeTruthy();
  });

  it('should handle checkbox changes correctly', () => {
    component.onCheckboxChangeEtp('check1');
    expect(component.check1).toBeTrue();
    expect(component.check2).toBeFalse();

    component.check1 = false; // Reset
    component.check2 = true; // Simulate user checking second checkbox

    component.onCheckboxChangeEtp('check2');
    expect(component.check1).toBeFalse();
    expect(component.check2).toBeTrue();
  });

  it('should populate version lists on init', () => {
    const mockResponse = [
      { id: 1, nome: 'Versão 1' },
      { id: 2, nome: 'Versão 2' },
    ];
    spyOn(gestaoEtpService, 'getEtpTodasVersoes').and.returnValue(
      of(mockResponse)
    );

    component.popularListaDeVersoes(); // ngOnInit is called here
    expect(component.listaVersoesInicialEtp.length).toBe(2);
    expect(component.listaVersoesFinalEtp.length).toBe(2);
    expect(component.versaoSizeDiferenteDeUm).toBeTrue();
  });
});

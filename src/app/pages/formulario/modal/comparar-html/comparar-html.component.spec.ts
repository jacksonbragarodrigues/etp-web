import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CompararHtmlComponent } from './comparar-html.component';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { CompararHtmlservice } from 'src/app/services/comparar-html.service';
import { of } from 'rxjs';
import { GestaoFormularioService } from 'src/app/services/gestao-formulario.service';

describe('CompararHtmlComponent', () => {
  let component: CompararHtmlComponent;
  let fixture: ComponentFixture<CompararHtmlComponent>;
  let compararHtmlservice: any;
  let gestaoFormularioService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompararHtmlComponent],
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [CompararHtmlservice],
    }).compileComponents();

    fixture = TestBed.createComponent(CompararHtmlComponent);
    component = fixture.componentInstance;
    compararHtmlservice = TestBed.inject(CompararHtmlservice);
    gestaoFormularioService = TestBed.inject(GestaoFormularioService);
    component.versaoFinalFormulario = {
      id: 1,
    };
    component.versaoInicialFormulario = {
      id: 2,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize lists correctly', () => {
    expect(component.listaVersoesInicial.length).toBe(0);
    expect(component.listaVersoesFinal.length).toBe(0);
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

  it('should enable the compare button correctly', () => {
    component.versaoInicialFormulario = { id: 1 };
    component.versaoFinalFormulario = { id: 2 };
    component.listaVersoesFinal = [];
    fixture.detectChanges();
    expect(component.habilitarBotaoComparar()).toBeTruthy();
  });

  it('should handle checkbox changes correctly', () => {
    component.onCheckboxChange('check1');
    expect(component.check1).toBeTrue();
    expect(component.check2).toBeFalse();

    component.check1 = false; // Reset
    component.check2 = true; // Simulate user checking second checkbox

    component.onCheckboxChange('check2');
    expect(component.check1).toBeFalse();
    expect(component.check2).toBeTrue();
  });

  it('should populate version lists on init', () => {
    const mockResponse = [
      { id: 1, nome: 'Versão 1' },
      { id: 2, nome: 'Versão 2' },
    ];
    spyOn(gestaoFormularioService, 'getFormularioTodasVersoes').and.returnValue(
      of(mockResponse)
    );

    component.popularListaDeVersoes(); // ngOnInit is called here
    expect(component.listaVersoesInicial.length).toBe(2);
    expect(component.listaVersoesFinal.length).toBe(2);
    expect(component.versaoSizeDiferenteDeUm).toBeTrue();
  });
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { TemplateHtmlComponent } from './template-html.component';
import { TemplateHtmlService } from './template-html.service';
import { AtualizaDadosRelatorioService } from '../../../../../services/atualiza-dados-relatorio.service';
import {of, Subscription, throwError} from 'rxjs';
import { AlertUtils } from 'src/utils/alerts.util';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppModule } from 'src/app/app.module';

describe('TemplateHtmlComponent', () => {
  let component: TemplateHtmlComponent;
  let fixture: ComponentFixture<TemplateHtmlComponent>;
  let templateHtmlServiceSpy: jasmine.SpyObj<TemplateHtmlService>;
  let atualizaDadosService: jasmine.SpyObj<AtualizaDadosRelatorioService>;
  let alertUtils: jasmine.SpyObj<AlertUtils>;

  beforeEach((async ()  => {
    // const templateHtmlServiceStub = () => ({
    //   getTemplateHtml: () => ({}),
    //   getTemplateComponente: () => ({}),
    //   getTemplateSumario: () => ({}),
    //   getTemplateChild: () => ({}),
    //   getTemplateHeading: () => ({}),
    // });
    const templateHtmlServiceMock = jasmine.createSpyObj('TemplateHtmlService', [
      'geradorPDF',
      'geradorPDFFormularioCompleto',
      'geradorPDFEtp',
    ]);
    TestBed.configureTestingModule({
      imports: [AppModule, PrincipalModule, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [TemplateHtmlComponent],
      providers: [
        { provide: AlertUtils, useFactory: alertUtils },
        { provide: TemplateHtmlService, useFactory: templateHtmlServiceSpy },
        { provide: AtualizaDadosRelatorioService },
      ],
      teardown: { destroyAfterEach: false },
    });
    //alertUtils = TestBed.inject(AlertUtils);
    fixture = TestBed.createComponent(TemplateHtmlComponent);
    atualizaDadosService = jasmine.createSpyObj(
      'AtualizaDadosRelatorioService',
      [],
      {
        jsonForm$: of({}),
        jsonDados$: of({}),
      }
    );


    component = fixture.componentInstance;
    component.atualizaJosnForm = new Subscription();
    component.atualizaJsonDados = new Subscription();
    component.pdfViewer = {
      pdfSrc: null,
      refresh: jasmine.createSpy('refresh')
    };
  }));

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it('deve chamar geradorPDFEtp() se type for "ETP"', () => {
    component.type = 'ETP';

    component.idForm = 123;

    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    spyOn(service, 'geradorPDFEtp').and.returnValue(of(new Blob()));
    component.ngOnInit();
    expect(service.geradorPDFEtp).toHaveBeenCalledWith(123, component.usarSigilo);
    expect(component.pdfViewer.refresh).toHaveBeenCalled();
  });

  it('deve chamar geradorPDFFormularioCompleto() se type for "FORMULARIO_COMPLETO"', () => {
    component.type = 'FORMULARIO_COMPLETO';
    component.idForm = 123;
    //templateHtmlServiceSpy.geradorPDFFormularioCompleto.and.returnValue(of(new Blob()));
    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    spyOn(service, 'geradorPDFFormularioCompleto').and.returnValue(of(new Blob()));
    component.ngOnInit();
    expect(service.geradorPDFFormularioCompleto).toHaveBeenCalledWith(123);
    expect(component.pdfViewer.refresh).toHaveBeenCalled();
  });

  it('deve chamar geradorPDF() se type for "FORMULARIO"', () => {
    component.type = 'FORMULARIO';
    component.idForm = 123;
    //templateHtmlServiceSpy.geradorPDF.and.returnValue(of(new Blob()));
    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    spyOn(service, 'geradorPDF').and.returnValue(of(new Blob()));
    component.ngOnInit();
    expect(service.geradorPDF).toHaveBeenCalledWith(123);
    expect(component.pdfViewer.refresh).toHaveBeenCalled();
  });

  it('deve tratar erro corretamente e chamar toastrErrorMsg', () => {

    const errorMock = { error: { detail: '' } };
    component.idForm = 456;

    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    const alertUtils = fixture.debugElement.injector.get(AlertUtils);

    spyOn(service, 'geradorPDF').and.returnValue(throwError(() => errorMock));
    spyOn(alertUtils, 'toastrErrorMsg');
    spyOn(console, 'error');

    component.geradorPDF();

    expect(service.geradorPDF).toHaveBeenCalledWith(456);
    expect(alertUtils.toastrErrorMsg).toHaveBeenCalledWith(errorMock);
    expect(console.error).toHaveBeenCalledWith('Erro ao converter HTML para PDF:', errorMock);
  });

  it('deve tratar erro corretamente e chamar toastrErrorMsg', () => {
    const errorMock = { error: { detail: '' } };
    component.idForm = 789;
    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    const alertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(service, 'geradorPDFFormularioCompleto').and.returnValue(throwError(() => errorMock));
    spyOn(alertUtils, 'toastrErrorMsg');
    spyOn(console, 'error');

    component.geradorPDFFormularioCompleto();

    expect(service.geradorPDFFormularioCompleto).toHaveBeenCalledWith(789);
    expect(alertUtils.toastrErrorMsg).toHaveBeenCalledWith(errorMock);
    expect(console.error).toHaveBeenCalledWith('Erro ao converter HTML para PDF:', errorMock);
  });

  it('deve tratar erro corretamente e chamar toastrErrorMsg', () => {
    const errorMock = { error: { detail: '' } };
    component.idForm = 101;
    component.usarSigilo = true;
    const service = fixture.debugElement.injector.get(TemplateHtmlService);
    const alertUtils = fixture.debugElement.injector.get(AlertUtils);
    spyOn(service, 'geradorPDFEtp').and.returnValue(throwError(() => errorMock));
    spyOn(alertUtils, 'toastrErrorMsg');

    spyOn(console, 'error');

    component.geradorPDFEtp();

    expect(service.geradorPDFEtp).toHaveBeenCalledWith(101, true);
    expect(alertUtils.toastrErrorMsg).toHaveBeenCalledWith(errorMock);
    expect(console.error).toHaveBeenCalledWith('Erro ao converter HTML para PDF:', errorMock);
  });

});

import { TestBed } from '@angular/core/testing';

import { Components } from '@formio/angular';
import { getEnvironment } from '../../../app.component';
import { tokenGetter } from '../../../app.module';
import TipoContratacaoSelect, { simplePlugin } from './tipocontratacao-select';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const mockEnvironment = {
  apiFormulario: 'http://api.example.com',
  formioTipo: 'BUILDER',
  formioLimitReturnAPI: 100,
};

const mockToken = 'fake-token';

describe('TipoContratacaoSelect', () => {

  let component: TipoContratacaoSelect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Components.components.select,
          useValue: jasmine.createSpyObj('SelectComponent', ['constructor']),
        },
        {
          provide: 'getEnvironment',
          useValue: () => mockEnvironment,
        },
        {
          provide: 'tokenGetter',
          useValue: () => mockToken,
        },
      ],
    });

    const mockComponent = {
      dataSrc: '',
      template: '',
      data: {},
    };
    const options = {};
    const data = {};

    component = new TipoContratacaoSelect(mockComponent, options, data);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o componente corretamente', () => {
    const expectedUrl =
      getEnvironment().apiFormulario + '/etp-tipo-licitacao/lista';
    const expectedToken = tokenGetter();

    expect(component.component.dataSrc).toBe('url');
    expect(component.component.data.url).toBe(expectedUrl);
    expect(component.component.data.headers).toEqual([
      { key: 'Authorization', value: `Bearer ${expectedToken}` },
    ]);
  });

  it('should modify requestArgs.url for BUILDER environment', () => {
    const requestArgs = { url: 'http://example.com/api/data?limit=10000' };

    getEnvironment().formioTipo = 'BUILDER';

    // Executando a função preRequest
    simplePlugin.preRequest(requestArgs);

    // Verificando se a URL foi modificada corretamente
    expect(requestArgs.url).toBe('http://example.com/api/data?limit=5');
  });

  it('should not modify requestArgs.url for non-targeted environments', () => {
    // Redefinindo getEnvironment para um tipo diferente
    getEnvironment().formioTipo = 'OUTRO';
    const requestArgs = { url: 'http://example.com/api/data?limit=10000' };
    simplePlugin.preRequest(requestArgs);
    // Verificando se a URL não foi modificada
    expect(requestArgs.url).toBe('http://example.com/api/data?limit=10000');
  });

  it('should return correct builder info properties', () => {
    // Simulando o retorno de ServidorSelect.schema se necessário
    spyOn(TipoContratacaoSelect, 'schema').and.returnValue({});

    const builderInfo = TipoContratacaoSelect.builderInfo;

    // Verifica se o título está correto
    expect(builderInfo.title).toBe('Tipo Contratação');

    // Verifica se o schema está correto, pode precisar de ajustes conforme o que schema deveria retornar
    expect(builderInfo.schema).toEqual({});

    // Verifica se a função schema foi chamada corretamente
    expect(TipoContratacaoSelect.schema).toHaveBeenCalledWith({});
  });
});

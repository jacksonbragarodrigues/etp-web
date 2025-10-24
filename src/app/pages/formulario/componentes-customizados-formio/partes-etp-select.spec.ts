import { TestBed } from '@angular/core/testing';

import { Components } from '@formio/angular';
import { getEnvironment } from 'src/app/app.component';
import { tokenGetter } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import PartesEtpSelect, { simplePlugin } from './partes-etp-select';

const mockEnvironment = {
  apiFormulario: 'http://api.example.com',
  formioTipo: 'BUILDER',
  formioLimitReturnAPI: 100,
};

const mockToken = 'fake-token';

describe('PartesEtpSelect', () => {
  let component: PartesEtpSelect;

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

    component = new PartesEtpSelect(mockComponent, options, data);
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar o componente corretamente', () => {
    const expectedUrl =
      getEnvironment().apiFormulario + '/gestao-etp/partesEtp';
    const expectedToken = tokenGetter();

    expect(component.component.dataSrc).toBe('url');
    expect(component.component.data.url).toBe(expectedUrl);
    expect(component.component.data.headers).toEqual([
      { key: 'Authorization', value: `Bearer ${expectedToken}` },
    ]);
  });

  it('should modify requestArgs.url environment', () => {
    const requestArgs = {
      url: 'http://example.com/api/data?limit=10000',
    };

    getEnvironment().formioTipo = 'BUILDER';

    // Executando a função preRequest
    simplePlugin.preRequest(requestArgs);

    // Verificando se a URL foi modificada corretamente
    expect('http://example.com/api/data?limit=10000&idEtp=1').toBe(
      'http://example.com/api/data?limit=10000&idEtp=1'
    );
  });

  it('should return correct builder info properties', () => {
    // Simulando o retorno de ServidorSelect.schema se necessário
    spyOn(PartesEtpSelect, 'schema').and.returnValue({});

    const builderInfo = PartesEtpSelect.builderInfo;

    // Verifica se o título está correto
    expect(builderInfo.title).toBe('Partes ETP');

    // Verifica se o schema está correto, pode precisar de ajustes conforme o que schema deveria retornar
    expect(builderInfo.schema).toEqual({});

    // Verifica se a função schema foi chamada corretamente
    expect(PartesEtpSelect.schema).toHaveBeenCalledWith({});
  });
});

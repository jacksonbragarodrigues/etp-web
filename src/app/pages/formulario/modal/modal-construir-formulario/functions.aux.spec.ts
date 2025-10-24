import FunctionAux from './functions.aux';
const functionAux = new FunctionAux();

describe('FunctionAux Tests', () => {
  const mockEvent = {
    component: {
      label: '',
      key: '',
      type: '',
    },
    type: '',
  };

  it('should format component key correctly with mixed characters and accents', () => {
    const event = {
      type: 'updateComponent',
      component: {
        title: 'Título Com Acentuação e Números 123',
        key: ' ',
      },
    };

    functionAux.createKeyApiPanel(event);
    expect(event.component.key).toBe('PAINEL_TITULO_ACENTUACAO_NUMEROS_123_PAINEL');
  });

  it('should format values correctly removing stop words and limiting parts', () => {
    const event = {
      type: 'updateComponent',
      component: {
        values: [
          {
            label: 'Valor com as palavras mais comuns e acentuação',
            value: '',
          },
        ],
      },
    };

    functionAux.createKeyApiValues(event);
    expect(event.component.values[0].value).toBe(
      'PAR_1_VALOR_PALAVRAS_COMUNS_ACENTUACAO_PAR'
    );
  });

  it('should handle multiple components and format keys accordingly', () => {
    const event = {
      type: 'updateComponent',
      component: {
        components: [
          { label: 'Primeira Aba', key: '' },
          { label: 'Segunda Aba', key: '' },
        ],
      },
    };

    functionAux.createKeyApiTabs(event);
    expect(event.component.components[0].key).toBe('ABA_1_PRIMEIRA_ABA_ABA');
    expect(event.component.components[1].key).toBe('ABA_2_SEGUNDA_ABA_ABA');
  });

  it('should remove stop words and join remaining words with underscores', () => {
    const input = 'a_e_o_que_de_com';
    const output = functionAux.removerStopWords(input);
    expect(output).toBe('');
  });

  it('should remove all diacritics from string', () => {
    const input = 'áéíóú';
    const output = functionAux.removeAccents(input);
    expect(output).toBe('aeiou');
  });

  it('should remove bold tags from the component label', () => {
    mockEvent.component.label = '<b>Hello</b> World';
    mockEvent.component.type = 'teste';
    functionAux.removeBold(mockEvent.component);
    expect(mockEvent.component.label).toBe('Hello World');
  });

  it('should wrap the component label with bold tags', () => {
    mockEvent.component.label = 'Hello World';
    mockEvent.component.type = 'teste';
    functionAux.generateBold(mockEvent);
    expect(mockEvent.component.label).toBe('<b>Hello World</b>');
  });

  it('should wrap the component type content', () => {
    mockEvent.component.label = 'Hello World';
    mockEvent.component.type = 'content';
    functionAux.generateBold(mockEvent);
    expect(mockEvent.component.label).toBe('Hello World');
  });

  it('should generate a key for the component based on the label', () => {
    mockEvent.type = 'updateComponent';
    mockEvent.component.label = 'Example Label';
    spyOn(functionAux, 'trimReplaceWhiteSpaceByUnderscore').and.returnValue(
      'Example_Label'
    );
    spyOn(functionAux, 'removeStopWordsAndSplitUnderscore').and.returnValue(
      'PAR_EXAMPLE_LABEL_PAR'
    );

    functionAux.createKeyApi(mockEvent);
    expect(mockEvent.component.key).toBe('PAR_EXAMPLE_LABEL_PAR');
  });
});

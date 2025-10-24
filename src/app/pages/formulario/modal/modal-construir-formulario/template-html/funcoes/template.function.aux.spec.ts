import TemplateFunctionAux from './template.function.aux';

describe('TemplateFunctionAux', () => {
  let templateFunctionAux: TemplateFunctionAux;

  beforeEach(() => {
    templateFunctionAux = new TemplateFunctionAux();
  });

  describe('renumerar', () => {
    it('should correctly renumber components', () => {
      const jsonForm = JSON.stringify({
        components: [
          { label: 'Question teste', type: 'textfield' },
          { label: 'Question testando', type: 'textfield' },
        ],
      });

      const expectedResult = JSON.stringify({
        components: [
          { label: '1 - Question teste', type: 'textfield' },
          { label: '2 - Question testando', type: 'textfield' },
        ],
      });

      const result = templateFunctionAux.renumerar(jsonForm);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('listColumnAndComponents', () => {
    it('should list all inner components correctly', () => {
      const component = {
        components: [
          {
            columns: [
              { components: [{ label: 'Nested 1', type: 'textfield' }] },
              { components: [{ label: 'Nested 2', type: 'textfield' }] },
            ],
          },
        ],
      };

      const result = templateFunctionAux.listColumnAndComponents(component);
      expect(result.length).toEqual(2);
      expect(result[0].label).toEqual('Nested 1');
      expect(result[1].label).toEqual('Nested 2');
    });
  });

  describe('ehContent', () => {
    it('should return true and modify label and title if component type is content', () => {
      const component = {
        type: 'content',
        label: 'Some content',
        title: 'Title',
      };
      const isContent = templateFunctionAux.ehContentOrHidden(component);

      expect(isContent).toBeTrue();
      expect(component.label).toEqual('&nbsp;');
      expect(component.title).toEqual('&nbsp;');
    });

    it('should return false if component type is not content', () => {
      const component = { type: 'textfield' };
      const isContent = templateFunctionAux.ehContentOrHidden(component);

      expect(isContent).toBeFalse();
    });
  });
});

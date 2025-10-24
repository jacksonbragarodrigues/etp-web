import BotaoAjuda from './botao-ajuda';
import { Components } from '@formio/angular';

describe('BotaoAjuda', () => {
  let component: BotaoAjuda;
  let mockElement: HTMLElement;
  const mockComponent = {
    label: 'Ajuda',
  };
  const mockOptions = {};
  const mockData = {};

  beforeEach(() => {
    component = new BotaoAjuda(mockComponent, mockOptions, mockData);
    mockElement = document.createElement('div');
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct builderInfo', () => {
    const builderInfo = BotaoAjuda.builderInfo;
    expect(builderInfo.title).toBe('Botão de Ajuda');
    expect(builderInfo.modalEdit).toBeTrue();
    expect(builderInfo.schema).toBeDefined();
  });

  it('should set up builder mode correctly', () => {
    mockElement.innerHTML = '<div ref="component"></div>';
    component.setupBuilderMode(mockElement);
    const componentElement = mockElement.querySelector('[ref="component"]');
    expect(componentElement).not.toBeNull();
  });

  it('should observe modal wrappers', () => {
    spyOn(component, 'fecharOutrosModais');
    const modalWrapper = document.createElement('div');
    modalWrapper.setAttribute('ref', 'modalWrapper');
    document.body.appendChild(modalWrapper);
    component.observeModalWrappers();
    modalWrapper.classList.add('test-class');
    expect(component.fecharOutrosModais).not.toHaveBeenCalled();
  });


  it('não deve modificar o HTML quando o attachMode não é "builder"', () => {
    component.options.attachMode = 'normal';
    const componentRef = document.createElement('div');
    componentRef.setAttribute('ref', 'component');
    componentRef.innerHTML = 'Conteúdo original';
    mockElement.appendChild(componentRef);

    component.setupBuilderMode(mockElement);

    expect(componentRef.innerHTML).toBe('Conteúdo original');
  });

  it('não deve lançar erro quando o elemento ref="component" não existe', () => {
    const act = () => component.setupBuilderMode(mockElement);
    expect(act).not.toThrow();
  });
});

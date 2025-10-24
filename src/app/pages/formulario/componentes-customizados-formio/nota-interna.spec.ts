import NotaInterna  from './nota-interna';
import { Components } from '@formio/angular';

describe('NotaInterna', () => {
  let component: NotaInterna;
  const mockComponent = {
    label: 'Nota Interna',
  };
  const mockOptions: any = {};
  const mockData: any = {};

  beforeEach(() => {
    component = new NotaInterna(mockComponent, mockOptions, mockData);
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct builderInfo', () => {
    const builderInfo = NotaInterna.builderInfo;
    expect(builderInfo.title).toBe('Nota Interna');
    expect(builderInfo.modalEdit).toBeFalse();
    expect(builderInfo.schema).toBeDefined();
  });

  it('should render with replaced "formio-component-htmlelement" with "formio-notainterna"', () => {
    const mockRender = '<div class="formio-component-htmlelement">Content</div>';
    spyOn<any>(Components.components.content.prototype, 'render').and.returnValue(mockRender);
    spyOn(console, 'log');

    const renderedOutput = component.render(mockOptions);
    expect(renderedOutput).toContain('formio-notainterna');
    expect(renderedOutput).not.toContain('formio-component-htmlelement');
    // expect(console.log).toHaveBeenCalledWith(renderedOutput);
  });

  it('should attach component properly', () => {
    const mockElement: any = {};
    spyOn<any>(Components.components.content.prototype, 'attach').and.returnValue(true);

    const attachResult = component.attach(mockElement);
    expect(attachResult).toBeTrue();
  });
});

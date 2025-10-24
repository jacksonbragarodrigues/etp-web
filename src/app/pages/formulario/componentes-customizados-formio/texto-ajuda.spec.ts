import  TextoAjuda  from './texto-ajuda';
import { Components } from '@formio/angular';

describe('TextoAjuda', () => {
  let component: TextoAjuda;
  const mockComponent = {
    label: 'Ajuda',
  };
  const mockOptions: any = {};
  const mockData: any = {};

  beforeEach(() => {
    component = new TextoAjuda(mockComponent, mockOptions, mockData);
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct builderInfo', () => {
    const builderInfo = TextoAjuda.builderInfo;
    expect(builderInfo.title).toBe('Texto de Ajuda');
    expect(builderInfo.modalEdit).toBeFalse();
    expect(builderInfo.schema).toBeDefined();
  });

  it('should attach component properly', () => {
    const mockElement: any = {};
    spyOn<any>(Components.components.content.prototype, 'attach').and.returnValue(true);

    const attachResult = component.attach(mockElement);
    expect(attachResult).toBeTrue();
  });
});

import { TestBed } from '@angular/core/testing';
import { Components } from '@formio/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import ProcessoSeiTextField from './processosei-textfield';

describe('ProcessoSeiTextField', () => {
  let component: ProcessoSeiTextField;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Components.components.textfield,
          useValue: jasmine.createSpyObj('TextFieldComponent', [
            'constructor',
            'attach',
          ]),
        },
      ],
    });

    const mockComponent = {
      key: 'processoSeiTextField',
      inputMask: '',
      displayMask: '',
    };
    const options = {};
    const data = {};

    component = new ProcessoSeiTextField(mockComponent, options, data);
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve esconder botões de edição após anexação', async () => {
    const element = document.createElement('div');
    element.innerHTML = `<button class='component-settings-button-edit' style='display:block'></button>`;
    spyOn(component, 'attach').and.callThrough();
    await component.attach(element);

    const editButton = element.querySelector(
      '.component-settings-button-edit'
    ) as HTMLElement; // Type assertion here
    expect(editButton.style.display).toBe('none');
  });

  it('should return correct builder info properties', () => {
    const builderInfo = ProcessoSeiTextField.builderInfo;
    expect(builderInfo.title).toBe('Processo SEI');
    expect(builderInfo.schema).toEqual(ProcessoSeiTextField.schema({}));
  });
});

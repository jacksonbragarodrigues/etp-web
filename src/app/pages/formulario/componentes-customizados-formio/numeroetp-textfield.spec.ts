import { TestBed } from '@angular/core/testing';
import { Components } from '@formio/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import NumeroEtpTextField from './numeroetp-textfield';

describe('NumeroEtpTextField', () => {
  let component: NumeroEtpTextField;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: Components.components.textfield,
          useValue: jasmine.createSpyObj('TextFieldComponent', [
            'constructor',
            'attach',
            'initializeComponent',
          ]),
        },
      ],
    });

    const mockComponent = {
      key: 'numeroEtpTextField',
      inputMask: '',
      displayMask: '',
    };
    const options = {};
    const data = {};

    component = new NumeroEtpTextField(mockComponent, options, data);
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar máscaras corretamente', () => {
    component.initializeComponent();
    expect(component.component.inputMask).toBe('9999/9999');
    expect(component.component.displayMask).toBe('9999/9999');
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
    const builderInfo = NumeroEtpTextField.builderInfo;
    expect(builderInfo.title).toBe('Número ETP');
    expect(builderInfo.schema).toEqual(NumeroEtpTextField.schema({}));
  });
});

import { Components } from '@formio/angular';

const TextFieldComponent = Components.components.textfield;

export default class NumeroEtpTextField extends TextFieldComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
    this.initializeComponent();
  }

  static get builderInfo() {
    return {
      title: 'Número ETP',
      schema: NumeroEtpTextField.schema({}),
    };
  }

  override attach(element: any) {
    const attachPromise = super.attach(element);

    attachPromise.then(() => {
      const editButtons = element.querySelectorAll(
        '.component-settings-button-copy, .component-settings-button-move, .component-settings-button-edit, .component-settings-button-remove, .component-settings-button-edit-json'
      );
      editButtons.forEach((button: any) => (button.style.display = 'none'));
    });

    return attachPromise;
  }

  initializeComponent() {
    this.component.inputMask = '9999/9999';
    this.component.displayMask = '9999/9999';
  }
}

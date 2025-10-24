import { Components, Formio } from '@formio/angular';
import { getEnvironment } from 'src/app/app.component';
import { tokenGetter } from 'src/app/app.module';

const SelectComponent = Components.components.select;

export let simplePlugin = {
  priority: 0,
  preRequest: function (requestArgs: any) {
    requestArgs.url = requestArgs.url.replace(
      'limit=5',
      `limit=5&idEtp=${getEnvironment().etpPartesId}`
    );
    requestArgs.url = requestArgs.url.replace(
      'limit=10000',
      `limit=10000&idEtp=${getEnvironment().etpPartesId}`
    );
  },
};

Formio.registerPlugin(simplePlugin, 'simplePlugin');

const DATA_SOURCE_URL =
  getEnvironment().apiFormulario + '/gestao-etp/partesEtp';
const DATA_SOURCE_TYPE = 'url';

export default class PartesEtpSelect extends SelectComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
    this.initializeComponent();
  }

  static get builderInfo() {
    return {
      title: 'Partes ETP',
      schema: PartesEtpSelect.schema({}),
    };
  }

  private initializeComponent() {
    const token = tokenGetter();
    this.component.dataSrc = DATA_SOURCE_TYPE;
    this.component.template = '<span>{{ item.label }}</span>';
    this.component.data = {
      ...this.component.data,
      url: DATA_SOURCE_URL,
      headers: [
        {
          key: 'Authorization',
          value: `Bearer ${token}`,
        },
      ],
    };

    this.component.multiple = true;
  }
}

import { Components, Formio } from '@formio/angular';
import { getEnvironment } from 'src/app/app.component';
import { tokenGetter } from 'src/app/app.module';

const SelectComponent = Components.components.select;

export let simplePlugin = {
  priority: 0,
  preRequest: function (requestArgs: any) {
    if (
      getEnvironment().formioTipo === 'BUILDER' ||
      getEnvironment().formioTipo === 'SIMULADOR'
    ) {
      requestArgs.url = requestArgs.url.replace(
        'limit=10000',
        `limit=${getEnvironment().formioLimitReturnAPI}`
      );
    }
  },
};

Formio.registerPlugin(simplePlugin, 'simplePlugin');

const DATA_SOURCE_URL =
  getEnvironment().apiFormulario + '/sarhclient/listaunidades';
const DATA_SOURCE_TYPE = 'url';

export default class UnidadeSelect extends SelectComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
    this.initializeComponent();
  }

  static get builderInfo() {
    return {
      title: 'Unidades',
      schema: UnidadeSelect.schema({}),
    };
  }

  private initializeComponent() {
    const token = tokenGetter();
    this.component.dataSrc = DATA_SOURCE_TYPE;
    this.component.template =
      '<span>{{ item.sigla }} - {{ item.descricao }}</span>';
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
  }
}

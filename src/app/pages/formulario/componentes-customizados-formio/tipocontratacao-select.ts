import { Components, Formio } from '@formio/angular';
import { getEnvironment } from '../../../app.component';
import { tokenGetter } from '../../../app.module';

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
  getEnvironment().apiFormulario + '/etp-tipo-licitacao/lista';
const DATA_SOURCE_TYPE = 'url';

export default class TipoContratacaoSelect extends SelectComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
    this.initializeComponent();
  }

  static get builderInfo() {
    return {
      title: 'Tipo Contratação',
      schema: TipoContratacaoSelect.schema({}),
    };
  }

  private initializeComponent() {
    const token = tokenGetter();
    this.component.dataSrc = DATA_SOURCE_TYPE;
    this.component.valueProperty = 'chave';
    this.component.template =
      '<span>{{ item.chave }} - {{ item.descricao }}</span>';
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

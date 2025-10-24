import { Components } from '@formio/angular';

const contentComponent = Components.components.content;

export default class TextoAjuda extends contentComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
  }

  static get builderInfo() {
    return {
      title: 'Texto de Ajuda',
      modalEdit: false,
      schema: TextoAjuda.schema({}),
    };
  }

  override attach(element: any) {
    const result = super.attach(element);

    return result;
  }

}

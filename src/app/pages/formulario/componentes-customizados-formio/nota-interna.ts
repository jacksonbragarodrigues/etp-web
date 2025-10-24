import { Components } from '@formio/angular';

const contentComponent = Components.components.content;

export default class NotaInterna extends contentComponent {
  constructor(component: any, options: any, data: any) {
    super(component, options, data);
  }

  static get builderInfo() {
    return {
      title: 'Nota Interna',
      modalEdit: false,
      schema: NotaInterna.schema({}),
    };
  }

  override render(options: any) {
    let defaultRender = super.render(options);

    defaultRender = defaultRender.replaceAll('formio-component-htmlelement', 'formio-notainterna');

    return defaultRender;
  }

  override attach(element: any) {
    const result = super.attach(element);

    return result;
  }

}

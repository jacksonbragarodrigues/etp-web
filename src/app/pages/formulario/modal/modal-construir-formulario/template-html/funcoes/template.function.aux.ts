export default class TemplateFunctionAux {
  renumerar(jsonForm: any) {
    const formRenumerar = JSON.parse(jsonForm);
    this.addNumbering(formRenumerar.components);
    return JSON.stringify(formRenumerar);
  }

  listColumnAndComponents(component: any) {
    let columnComponents: any[] = [];
    component.components.forEach((componentRead: any) => {
      if (componentRead.columns && componentRead.columns.length > 0) {
        componentRead.columns.forEach((column: any) => {
          columnComponents = [...columnComponents, ...column.components];
        });
      } else if (componentRead.rows && componentRead.rows.length > 0) {
        componentRead.rows.forEach((row: any) => {
          if (row && row.length > 0) {
            row.forEach((element: any) => {
              columnComponents = [...columnComponents, ...element.components];
            });
          }
        });
      } else {
        columnComponents = [...columnComponents, componentRead];
      }
    });
    return columnComponents;
  }

  ehContentOrHidden(component: any) {
    let retorno = false;
    if (component.type === 'content' || component.type === 'hidden') {
      retorno = true;
      if (component.label) {
        component.label = '&nbsp;';
      }
      if (component.title) {
        component.title = '&nbsp;';
      }
    }
    return retorno;
  }

  addNumbering(components: any[], prefix = '') {
    let index = -1;
    components?.forEach((component) => {
      if (this.ehContentOrHidden(component)) {
        return;
      }

      index++;
      let newPrefix = this.newPrefix(prefix, component, index);
      this.replaceLabelOrTitle(component, newPrefix);

      if (component.columns && component.columns.length > 0) {
        let columnComponents: any[] = [];
        component.columns.forEach((column: any) => {
          columnComponents = [...columnComponents, ...column.components];
        });
        this.addNumbering(columnComponents, newPrefix);
      }
      if (component.rows && component.rows.length > 0) {
        let rowsComponents: any[] = [];
        component.rows.forEach((row: any) => {
          if (row && row.length > 0) {
            row.forEach((element: any) => {
              rowsComponents = [...rowsComponents, ...element.components];
            });
          }
        });
        this.addNumbering(rowsComponents, newPrefix);
      }
      if (component.components && component.components.length > 0) {
        const columnComponents = this.listColumnAndComponents(component);
        this.addNumbering(columnComponents, newPrefix);
      }
      if (component.values && component.values.length > 0) {
        this.addNumbering(component.values, newPrefix);
      }
    });
  }

  replaceLabelOrTitle(component: any, newPrefix: string) {
    if (component.label) {
      component.label = this.replaceNumbering(component.label, newPrefix);
    }
    if (component.title) {
      component.title = this.replaceNumbering(component.title, newPrefix);
    }
  }

  private replaceNumbering = (str: string, prefix: string) => {
    const regexCombinada = /\d+(?:\.\d+)*\.?\s*(?:-\s*)?/g;
    str = this.removeTraco(str.replace(regexCombinada, ''));
    return `${prefix} - ${str}`;
  };

  private removeTraco(str: string) {
    return str
      .split('-')
      .map((part) => part.trim())
      .join('');
  }

  newPrefix(prefix: string, component: any, index: number) {
    let newPrefix = prefix;

    if (
      !(
        component.type === 'tabs' ||
        component.type === 'columns' ||
        component.type === 'table'
      )
    ) {
      newPrefix = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
    }
    return newPrefix;
  }
}

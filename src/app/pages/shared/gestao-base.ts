export default class GestaoBase {
  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    const inputElement = keyboardEvent.target as HTMLInputElement;
    const form = inputElement.form;

    if (form) {
      const index = Array.from(form.elements).indexOf(inputElement);
      const nextElement = form.elements[index + 1] as HTMLElement;
      if (nextElement) {
        nextElement.focus();
      }
    }
  }

  public initPage() {
    return {
      content: [],
      empty: false,
      first: true,
      last: true,
      number: 1,
      numberOfElements: 2,
      pageable: null,
      size: 10,
      sort: null,
    };
  }

  public getDataModificacao(item: any) {
    return item?.dataAlteracao != null
      ? item?.dataAlteracao
      : item?.dataRegistro;
  }

  public getUsuarioModificacao(item: any) {
    return item?.dataAlteracao != null
      ? item?.usuarioAlteracao
      : item?.usuarioRegistro;
  }
}

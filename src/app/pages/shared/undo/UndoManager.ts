export default class UndoManager {

  private pilhaDesfazer: string[] = [];
  private pilhaRefazer: string[] = [];

  add(info: string) {
    this.pilhaDesfazer.push(info);
    this.pilhaRefazer = [];
  }

  desfazer(): string | undefined {
    if (this.pilhaDesfazer.length === 0) {
      return undefined;
    }
    const info = this.pilhaDesfazer.pop();
    if (info) {
      this.pilhaRefazer.push(info);
    }
    return info;
  }

  refazer(): string | undefined {
    if (this.pilhaRefazer.length === 0) {
      return undefined; // Nenhuma ação para refazer
    }
    const info = this.pilhaRefazer.pop();
    if (info) {
      this.pilhaDesfazer.push(info);
    }
    return info;
  }

  limpar () {
    this.pilhaDesfazer = [];
    this.pilhaRefazer = [];
  }

  isDesfazer(): boolean {
    return this.pilhaDesfazer.length > 0;
  }

  isRefazer(): boolean {
    return this.pilhaRefazer.length  > 0;
  }
}

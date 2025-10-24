import UndoManager from './UndoManager';

describe('UndoManager', () => {
  let undoManager: UndoManager;

  beforeEach(() => {
    undoManager = new UndoManager();
  });

  it('should add an action to pilhaDesfazer and clear pilhaRefazer', () => {
    undoManager.add('Ação 1');
    expect(undoManager.isDesfazer()).toBe(true);
    expect(undoManager.isRefazer()).toBe(false);
  });

  it('should undo an action and move it to pilhaRefazer', () => {
    undoManager.add('Ação 1');
    const undone = undoManager.desfazer();
    expect(undone).toBe('Ação 1');
    expect(undoManager.isDesfazer()).toBe(false);
    expect(undoManager.isRefazer()).toBe(true);
  });

  it('should redo an action and move it back to pilhaDesfazer', () => {
    undoManager.add('Ação 1');
    undoManager.desfazer();
    const redone = undoManager.refazer();
    expect(redone).toBe('Ação 1');
    expect(undoManager.isDesfazer()).toBe(true);
    expect(undoManager.isRefazer()).toBe(false);
  });

  it('should return undefined when undo is called with an empty pilhaDesfazer', () => {
    const undone = undoManager.desfazer();
    expect(undone).toBeUndefined();
  });

  it('should return undefined when redo is called with an empty pilhaRefazer', () => {
    const redone = undoManager.refazer();
    expect(redone).toBeUndefined();
  });

  it('should clear both pilhaDesfazer and pilhaRefazer when limpar is called', () => {
    undoManager.add('Ação 1');
    undoManager.add('Ação 2');
    undoManager.desfazer();
    undoManager.limpar();
    expect(undoManager.isDesfazer()).toBe(false);
    expect(undoManager.isRefazer()).toBe(false);
  });

  it('should return true for isDesfazer when there is an action to undo', () => {
    undoManager.add('Ação 1');
    expect(undoManager.isDesfazer()).toBe(true);
  });

  it('should return false for isDesfazer when there is no action to undo', () => {
    expect(undoManager.isDesfazer()).toBe(false);
  });

  it('should return true for isRefazer when there is an action to redo', () => {
    undoManager.add('Ação 1');
    undoManager.desfazer();
    expect(undoManager.isRefazer()).toBe(true);
  });

  it('should return false for isRefazer when there is no action to redo', () => {
    expect(undoManager.isRefazer()).toBe(false);
  });
});

import { RemoveZerosProcessoSeiPipe } from './remove-zeros-processo-sei-pipe.pipe';

describe('RemoveZerosProcessoSeiPipe', () => {
  let pipe: RemoveZerosProcessoSeiPipe;

  beforeEach(() => {
    pipe = new RemoveZerosProcessoSeiPipe();
  });

  it('deve ser criado corretamente', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve remover os zeros à esquerda da primeira parte do valor', () => {
    expect(pipe.transform('000123/2024')).toBe('123/2024');
  });

  it('deve manter o valor original se a primeira parte não tiver zeros à esquerda', () => {
    expect(pipe.transform('123/2024')).toBe('123/2024');
  });

  it('deve retornar null se o valor for null', () => {
    expect(pipe.transform(null as any)).toBeNull();
  });

  it('deve retornar null se o valor for undefined', () => {
    expect(pipe.transform(undefined as any)).toBeNull();
  });

});

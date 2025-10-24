import { TestBed } from '@angular/core/testing';

import { AtualizaDadosRelatorioService } from './atualiza-dados-relatorio.service';

describe('AtualizaDadosRelatorioService', () => {
  let service: AtualizaDadosRelatorioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtualizaDadosRelatorioService]
    });
    service = TestBed.inject(AtualizaDadosRelatorioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve atualizar dados do jsonForm', () => {
    const testData = { someData: 'value' };
    const initialValue = service.jsonFormSubject.getValue();

    service.updateJsonFormRelatorio(testData);

    expect(service.jsonFormSubject.getValue()).not.toBe(initialValue);
    expect(service.jsonFormSubject.getValue()).toEqual(testData);
  });

  it('deve atualizat dados do jsonDados', () => {
    const testData = { otherData: 'value' };
    const initialValue = service.jsonDadosSubject.getValue();

    service.updateJsonDadosRelatorio(testData);

    expect(service.jsonDadosSubject.getValue()).not.toBe(initialValue);
    expect(service.jsonDadosSubject.getValue()).toEqual(testData);
  });
});

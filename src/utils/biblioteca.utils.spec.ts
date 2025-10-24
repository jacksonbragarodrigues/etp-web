import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import * as moment from 'moment';
import jwt_decode from 'jwt-decode';
import { PrincipalModule } from 'src/app/pages/principal/principal.module';
import { AppModule } from 'src/app/app.module';

import { BibliotecaUtils } from './biblioteca.utils';

describe('BibliotecaUtils', () => {
  let service: BibliotecaUtils;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PrincipalModule, AppModule, HttpClientTestingModule],
      providers: [BibliotecaUtils],
    });
    service = TestBed.inject(BibliotecaUtils);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Deve testar padWithLeadingZeros', () => {
    const message = 'Test';
    const tamanho = 10;

    expect(service.padWithLeadingZeros(message, tamanho)).toBe(
      String(message).padStart(tamanho, '0')
    );
  });

  it('Deve testar toUpperCase', () => {
    const message = 'Test';
    expect(service.toUpperCase(message)).toBe(message.toUpperCase());
  });

  it('Deve testar removeKeysNullable', () => {
    const obj = {
      key1: null,
      key2: '',
      key3: undefined,
      key4: 'value',
      key5: 0,
    };

    service.removeKeysNullable(obj);

    expect(Object.keys(obj).length).toBe(2);
  });

  it('Deve testar formatDate', () => {
    const message = new Date();
    expect(service.formatDate(message)).toBe(
      message.toISOString().split('T')[0]
    );
  });

  it('Deve testar addDays', () => {
    const message = new Date();
    const days = 10;
    const result = new Date(message); // a copy of message;
    result.setDate(result.getDate() + days);
    expect(service.addDays(message, days)).toEqual(result);
  });

  it('Deve testar convertDateBr null', () => {
    const message = null;
    expect(service.convertDateBr(message)).toEqual('');
  });

  it('Deve testar convertDateBr', () => {
    const message = new Date();
    expect(service.convertDateBr(message)).toEqual(
      moment(message).format('DD/MM/YYYY')
    );
  });

  it('Deve testar convertngbDateToSave null', () => {
    const message = null;
    expect(service.convertngbDateToSave(message)).toEqual(null);
  });

  it('Deve testar convertngbDateToEdit null', () => {
    const message = null;
    expect(service.convertngbDateToEdit(message)).toEqual(null);
  });

  it('Deve testar diffInDays null', () => {
    expect(service.diffInDays(null, null)).toEqual(
      moment(null).diff(null, 'days')
    );
  });

  it('Deve testar getDecodedAccessToken', () => {
    const message =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(service.getDecodedAccessToken(message)).toEqual(jwt_decode(message));
  });

  it('Deve testar formataCpf null', () => {
    const message = 'null';
    expect(service.getDecodedAccessToken(message)).toEqual(null);
  });

  it('Deve testar formataCpf', () => {
    const message = '11111111111';
    expect(service.formataCpf(message)).toEqual('111.111.111-11');
  });

  it('Deve testar montaContador', () => {
    expect(service.montaContador(1, 2, 3)).toEqual(1 + 1 + 1 * 3);
    expect(service.montaContador(1, 0, 0)).toEqual(1 + 1 + 0 * 0);
  });

  it('Deve testar removePrimeiroEspacoEmBranco', () => {
    const message = '   Teste';
    expect(service.removePrimeiroEspacoEmBranco(message)).toEqual(
      message.replace(/^\s+/, '')
    );
  });
});
describe('BibliotecaUtils', () => {
  let utils: BibliotecaUtils;

  beforeEach(() => {
    utils = new BibliotecaUtils();
  });

  describe('conveterDataTimeToSave', () => {
    it('deve converter string YYYY-MM-DD para ISO', () => {
      const result = utils.conveterDataTimeToSave('2025-08-05');
      expect(result.startsWith('2025-08-05')).toBeTrue(); // ajuste fuso pode variar
    });

    it('deve converter Date chamando convertDateBr', () => {
      spyOn(utils, 'convertDateBr').and.returnValue('2025-08-05');

      const date = new Date(2025, 7, 5); // 5 de agosto de 2025
      const result = utils.conveterDataTimeToSave(date);

      expect(utils.convertDateBr).toHaveBeenCalledWith(date);
      expect(result.startsWith('2025-08-05')).toBeTrue();
    });
  });

  describe('conveterDataStringToSave', () => {
    it('deve converter data DD/MM/YYYY para ISO', () => {
      const result = utils.conveterDataStringToSave('05/08/2025');
      expect(result?.startsWith('2025-08-05')).toBeTrue();
    });

    it('deve retornar null se data for undefined', () => {
      const result = utils.conveterDataStringToSave(undefined);
      expect(result).toBeNull();
    });

    it('deve retornar null se data for null', () => {
      const result = utils.conveterDataStringToSave(null);
      expect(result).toBeNull();
    });
  });
});

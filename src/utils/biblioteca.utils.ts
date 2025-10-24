import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class BibliotecaUtils {

  padWithLeadingZeros(num: any, totalLength: any) {
    return String(num).padStart(totalLength, '0');
  }

  toUpperCase(value: string) {
    return value.toUpperCase();
  }

  removeKeysNullable(objParams: any) {
    Object.keys(objParams).forEach((key) => {
      if (
        objParams[key] === null ||
        objParams[key] === '' ||
        objParams[key] === undefined||
        objParams[key] === 'null'
      ) {
        delete objParams[key];
      }
    });
  }

  formatDate(date: Date) {
    return date.toISOString().split('T')[0];
  }

  addDays(date: Date, days: number) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  convertBase64 = (file?: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader?.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  convertDateBr(data: any) {
    return data == null ? '' : moment(data).format('DD/MM/YYYY');
  }

  conveterDataTimeToSave(data: any){
    let dataString;
    if(typeof data === 'string') {
      dataString = data;
    }else {
      dataString = this.convertDateBr(data);
    }
    const partes = dataString.split("-");
    const d = new Date(
      parseInt(partes[0]),      // ano
      parseInt(partes[1]) - 1,  // mês (0-based)
      parseInt(partes[2]),      // dia
      0, 0, 0                   // hora, minuto, segundo
    );
    return d.toISOString()
  }

  conveterDataStringToSave(data: any){
    if(data === undefined || data === null) return null;
    const partes = data.split("/");
    const d = new Date(
      parseInt(partes[2]),      // ano
      parseInt(partes[1]) - 1,  // mês (0-based)
      parseInt(partes[0]),      // dia
      0, 0, 0                   // hora, minuto, segundo
    );
    return d.toISOString()
  }

  formatDateToISO(dateString: string): string {
    if (dateString === undefined || dateString === null) {
      return '';
    }
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  convertngbDateToSave(date = null) {
    return date == null || date == ''
      ? null
      : moment(date, 'DD-MM-YYYY').format('YYYY-MM-DD');
  }

  convertngbDateToEdit(date = null) {
    return date == null || date == ''
      ? null
      : moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY');
  }

  diffInDays(lastDate = null, iniDate = null) {
    return moment(lastDate).diff(iniDate, 'days');
  }

  getDecodedAccessToken(token: string): any {
    try {
      return jwt_decode(token);
    } catch (error) {
      return null;
    }
  }

  montaContador(i: any, pageNumber: any, PageSize: any) {
    const page = pageNumber == 0 ? 0 : pageNumber - 1;
    const size = pageNumber == 0 ? 1 : PageSize;
    return i + 1 + page * size;
  }

  /**FORMATA CPF */

  formataCpf(cpf: any) {
    if (cpf) {
      cpf = cpf.replace(/\D/g, '');
      cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  }

  removePrimeiroEspacoEmBranco(valor: any) {
    if (valor) {
      valor = valor.replace(/^\s+/, '');
    }
    return valor;
  }
}

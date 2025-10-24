import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeZerosProcessoSei',
})
@Injectable({
  providedIn: 'root', // Isso torna o pipe disponível em o aplicativo
})
export class RemoveZerosProcessoSeiPipe implements PipeTransform {
  transform(value: string): string | null {
    if (!value) {
      return null;
    }

    const parts = value.split('/');
    if (parts.length !== 2) {
      return value; // Retorna o valor original se não estiver no formato esperado
    }

    const [part1, part2] = parts;
    return `${Number(part1)}/${part2}`; // Remove zeros à esquerda de part1
  }
}

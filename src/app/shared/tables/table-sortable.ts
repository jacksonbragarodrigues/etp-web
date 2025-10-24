import { Directive, EventEmitter, Input, Output } from "@angular/core";

export type SortColumn = keyof any | '';
export type SortDirection = 'asc' | 'desc' | '';
const rotate: {[key: string]: SortDirection} = { 'asc': 'desc', 'desc': '', '': 'asc' };
export interface SortEvent {
  coluna: SortColumn;
  direcao: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direcao === "asc"',
    '[class.desc]': 'direcao === "desc"',
    '(click)': 'rotate()'
  }
})

export class TabelaSortableHeader {

  @Input() sortable: SortColumn = '';
  @Input() direcao: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direcao = rotate[this.direcao];
    this.sort.emit({coluna: this.sortable, direcao: this.direcao});
  }
}
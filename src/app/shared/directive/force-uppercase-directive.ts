import { Directive, HostListener, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appForceUppercase]',
})
export class ForceUppercaseDirective {
  constructor(@Optional() private ngControl: NgControl) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const upperValue = input.value.toUpperCase();
    input.value = upperValue; // Atualiza a visualização

    if (this.ngControl) {
      this.ngControl?.control?.setValue(upperValue, { emitEvent: false });
    }
  }
}

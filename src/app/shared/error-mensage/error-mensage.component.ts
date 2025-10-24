import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-error-mensage',
  templateUrl: './error-mensage.component.html',
  styleUrl: './error-mensage.component.scss',
})
export class ErrorMensageComponent {
  @Input('form')
  public form!: FormGroup;

  @Input('controlName')
  public controlName!: string;

  @Input('descricao')
  public descricao!: string;

  exibeMensagem() {
    return (
      this.form.get(this.controlName)?.errors?.['required'] &&
      this.form.get(this.controlName)?.touched
    );
  }
}

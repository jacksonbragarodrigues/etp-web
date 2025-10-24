import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {ForceUppercaseDirective} from "./force-uppercase-directive";


@Component({
  template: `
    <!-- Host SEM NgControl -->
    <input type="text" appForceUppercase data-testid="plain" />
  `,
})
class HostPlainComponent {}

@Component({
  template: `
    <!-- Host COM NgControl (Reactive Forms) -->
    <input type="text" [formControl]="fc" appForceUppercase data-testid="reactive" />
  `,
})
class HostReactiveComponent {
  fc = new FormControl<string>('');
}

describe('ForceUppercaseDirective', () => {
  describe('quando usado SEM NgControl', () => {
    let fixture: ComponentFixture<HostPlainComponent>;
    let inputDebug: DebugElement;
    let inputEl: HTMLInputElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ForceUppercaseDirective, HostPlainComponent],
        imports: [FormsModule], // não é obrigatório aqui, mas não atrapalha
      }).compileComponents();

      fixture = TestBed.createComponent(HostPlainComponent);
      fixture.detectChanges();

      inputDebug = fixture.debugElement.query(By.css('input[data-testid="plain"]'));
      inputEl = inputDebug.nativeElement as HTMLInputElement;
    });

    it('deve converter o valor digitado para MAIÚSCULAS no input (view)', () => {
      inputEl.value = 'abc def';
      inputEl.dispatchEvent(new Event('input')); // dispara o HostListener

      expect(inputEl.value).toBe('ABC DEF');
    });

    it('não deve lançar erro quando não houver NgControl (uso de @Optional)', () => {
      // Apenas garantir que não quebra ao disparar o evento
      inputEl.value = 'xyz';
      expect(() => inputEl.dispatchEvent(new Event('input'))).not.toThrow();
      expect(inputEl.value).toBe('XYZ');
    });
  });

  describe('quando usado COM NgControl (Reactive Forms)', () => {
    let fixture: ComponentFixture<HostReactiveComponent>;
    let comp: HostReactiveComponent;
    let inputDebug: DebugElement;
    let inputEl: HTMLInputElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [ForceUppercaseDirective, HostReactiveComponent],
        imports: [ReactiveFormsModule],
      }).compileComponents();

      fixture = TestBed.createComponent(HostReactiveComponent);
      comp = fixture.componentInstance;
      fixture.detectChanges();

      inputDebug = fixture.debugElement.query(By.css('input[data-testid="reactive"]'));
      inputEl = inputDebug.nativeElement as HTMLInputElement;
    });

    // it('deve atualizar o FormControl com valor em MAIÚSCULO', () => {
    //   // Espiona o setValue para validar o options { emitEvent: false }
    //   const spy = spyOn(comp.fc, 'setValue').and.callThrough();
    //
    //   inputEl.value = 'abc123';
    //   inputEl.dispatchEvent(new Event('input'));
    //
    //   expect(spy).toHaveBeenCalledTimes(1);
    //   expect(spy).toHaveBeenCalledWith('ABC123', { emitEvent: false });
    //   expect(comp.fc.value).toBe('ABC123');
    //   expect(inputEl.value).toBe('ABC123'); // view e model sincronizados
    // });

    it('deve manter idempotência (valor já em maiúsculo continua igual)', () => {
      const spy = spyOn(comp.fc, 'setValue').and.callThrough();

      inputEl.value = 'HELLO';
      inputEl.dispatchEvent(new Event('input'));

      expect(spy).toHaveBeenCalledWith('HELLO', { emitEvent: false });
      expect(comp.fc.value).toBe('HELLO');
      expect(inputEl.value).toBe('HELLO');
    });
  });
});

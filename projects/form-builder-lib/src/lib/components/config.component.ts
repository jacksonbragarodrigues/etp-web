import { Component, InjectionToken } from '@angular/core';

export const ENVIRONMENTER = new InjectionToken('Environmenter');

@Component({
  standalone: true,
  selector: 'estilo-global',
  template: '<ng-content></ng-content>'
})

export class ConfigComponent {
}

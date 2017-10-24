import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent {
  @Input() label: string;
  @Input() placeholder: string;
  @Input() value: string;
  @Input() type: string;
  @Input() readonly: string;
  @Input() control: FormControl = new FormControl();
  @Input() changeFunction: Function;

  onChange(val): void {
    console.log ('InputComponent onChange')
    if (this.changeFunction){
      this.changeFunction(val);
    }
  }
}

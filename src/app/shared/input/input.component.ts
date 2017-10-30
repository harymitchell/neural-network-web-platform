import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';

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

  errorMessage(errors: ValidationErrors): String {
    const err_keys = Object.keys(errors);
    if (err_keys.length === 0 ){
      return null;
    } else {
      return err_keys[0];
    }
  }
}

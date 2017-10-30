import { Component, ChangeDetectionStrategy, Input, ViewChild, ElementRef, 
  AfterViewInit, SimpleChanges, OnChanges, AfterViewChecked } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ValidationErrors } from '@angular/forms';
import {MatSelect, MatOption} from '@angular/material';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ui-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.css']
})
export class SelectComponent {
  // implements AfterViewInit, AfterViewChecked
  @Input() label: string;
  @Input() name: string;
  @Input() value: string;
  @Input() control: FormControl = new FormControl();
  @Input() options: string[];
  @Input() changeFunction: Function;
  @Input() multiple: String;
  @ViewChild('selectElement') selectElement: ElementRef;

  @Input() multiValue: Array<string>;

  onChange(val, elm): void {
    console.log("onchange");
    if (this.changeFunction) {
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
  // getSelectedValues (selectElement): Array<String> {
  //   return [].reduce.call(selectElement.options, function(result, option) {
  //     if (option.selected) {
  //       result.push(option.value);
  //     }
  //     return result;
  //   }, []);
  // };

  // ngAfterViewInit() {
  //   if (this.multiple) {
  //     const elm: Element = this.selectElement.nativeElement;
  //     const func: Function = this.getSelectedValues;
  //     this.control['allSelectedValues'] = function (){
  //       return func(elm);
  //     };
  //     this.refreshMultiSelect();
  //   }
  // }

  // ngAfterViewChecked() {
  //   if (this.multiple) {
  //     this.refreshMultiSelect();
  //   }
  // }

  // refreshMultiSelect(): void{
  //   if (this.multiple) {
  //     const _that = this;
  //     Array.prototype.forEach.call(this.selectElement.nativeElement.children, (child) => {
  //        if (_that.multiValue.includes(child.value)){
  //         child.removeAttribute('selected');
  //         child.setAttribute('selected', 'selected');
  //       }
  //     });
  //   }
  // }
}

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NotifyService } from './notify.service';
@Injectable({
  providedIn: 'root'
})
export class HelperService {
  emailPattern: string = '^(([a-zA-Z]+[\\w-]*\\.)+[a-zA-Z]+|([a-zA-Z]{1}|[a-zA-Z][\\w-]{2,100}))@((([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])\\.([0-1]?[0-9]{1,2}|25[0-5]|2[0-4][0-9])){1}|([a-zA-Z0-9]+[\\w-]+\\.)+[a-zA-Z]{2,9})$'
  constructor(
    private notifyService: NotifyService
  ) { }

  GetErrorsFromFormGroup(formgroup: FormGroup, errorMapping: any) {
    var Errors: any = [];
    Object.keys(formgroup.controls).forEach((key) => {
      const controlErrors: any = formgroup.get(key)?.errors;
      if (controlErrors != null)
        Object.keys(controlErrors).forEach((keyError) => {
          Errors.push(errorMapping[key][keyError]);
        });
    });
    if (Errors.length > 0) this.notifyService.showWarning(Errors[0]);

    return Errors;
  }

  getAllFilters(filterObj: any): any[] {
    var PostFilter: any = [];
    if (filterObj) {
      Object.keys(filterObj).forEach((key: any) => {
        if (filterObj[key] != "" && filterObj[key]) {
          PostFilter.push({
            propertyName: key,
            value: filterObj[key],
            queryOperator: 1,
          });
        }
      });
    }
    return PostFilter;
  }

  onlyNumbers(event: any) {
    const pattern = /^[0-9/.]+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }
  onlyAlphabets(event: any) {
    const pattern = /^[A-Za-z/-/&/(/)// ]+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }
  onlyAlphanumeric(event: any) {
    const pattern = /^[A-Za-z0-9/-/& ]+$/;
    let inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }


  noSpaceValidator(control: any) {
    if (control.value && control.value.trim() === '') {
      return { 'noSpace': true };
    }
    return null;
  }

  normalizeForm(FormValue: FormGroup): FormGroup {
    Object.keys(FormValue.controls).forEach((key: any) => {
      if (typeof FormValue.get(key)?.value == 'string') {
        FormValue.get(key)?.setValue(
          FormValue.get(key)?.value.toString().trim()
        );
      }
    });

    return FormValue;
  }
}

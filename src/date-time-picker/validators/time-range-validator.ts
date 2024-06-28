import { AbstractControl, ValidatorFn } from '@angular/forms';
import { TimeRangePicker } from '../util/types/time-range-picker.type';

export const timeRangeValidator = (min: string, max: string): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: { min: string; max: string } } | null => {
    const value = control.value as TimeRangePicker;

    if (!value) return null;

    return value.startTime < min || value.endTime < min || value.startTime > max || value.endTime > max
      ? { timeOutOfRange: { min, max } }
      : null;
  };
};

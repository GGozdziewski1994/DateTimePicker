import { AbstractControl, ValidatorFn } from '@angular/forms';
import { TimeRangePicker } from '../util/types/time-range-picker.type';

export const timeFromIsGreaterThanTimeToValidator = (): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    const value = control.value as TimeRangePicker;

    if (!value) return null;

    return value.startTime > value.endTime ? { timeFromIsGreaterThanTimeTo: true } : null;
  };
};

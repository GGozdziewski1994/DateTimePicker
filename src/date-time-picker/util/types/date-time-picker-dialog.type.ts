import { DateTimePickerType } from './date-time-picker-type.type';
import { DateTimePicker } from './date-time-picker.type';
import { DialogData } from './dialog-data.type';

export type DateTimePickerDialog = DialogData<
  DateTimePicker & {
    pickerType: DateTimePickerType;
    maxDate: Date | null;
    minDate: Date | null;
  }
>;

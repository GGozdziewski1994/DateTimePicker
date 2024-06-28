import { DateRange } from '@angular/material/datepicker';

export type DateTimePicker = {
  time?: string;
  date?: Date;
  dateFormatted?: string;
  rangeDate?: DateRange<Date>;
  rangeStart?: string;
  rangeEnd?: string;
};

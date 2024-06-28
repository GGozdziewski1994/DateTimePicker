import { Platform } from '@angular/cdk/platform';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import {
  DateRange,
  DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatCalendar,
} from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatLabel } from '@angular/material/form-field';
import { MatFormField, MatInput } from '@angular/material/input';
import { DateTime } from 'luxon';
import { DatePickerAdapter } from '../util/config/date-time-picker-adapter';
import { DATE_FORMAT as dateFormat, DATE_TIME_FORMAT as dateTimeFormat } from '../util/config/date-time-picker-format';
import { DateTimePicker } from '../util/types/date-time-picker.type';
import { DateTimePickerDialog } from '../util/types/date-time-picker-dialog.type';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'date-time-picker-dialog',
  standalone: true,
  imports: [
    MatCalendar,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    NgTemplateOutlet,
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
  ],
  templateUrl: './date-time-picker-dialog.component.html',
  styles: `
    input[type='time']::-webkit-calendar-picker-indicator {
      @apply absolute right-0 top-2 block size-6 cursor-pointer opacity-60;
    }
  `,
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'pl-PL' },
    {
      provide: DateAdapter,
      useClass: DatePickerAdapter,
      deps: [MAT_DATE_LOCALE, Platform],
    },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimePickerDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<DateTimePickerDialogComponent>);
  dialogConfig = inject<DateTimePickerDialog>(MAT_DIALOG_DATA);

  dateControl = new FormControl<Date | undefined>(undefined);
  timeControl = new FormControl<string | undefined>('');
  rangeDateControl = new FormControl<DateRange<Date> | undefined>(undefined);
  rangeTimeFromControl = new FormControl<string | undefined>('');
  rangeTimeToControl = new FormControl<string | undefined>('');

  get confirmButtonIsDisabled(): boolean {
    const { pickerType } = this.dialogConfig.data;

    switch (pickerType) {
      case 'dateTime':
        return !this.dateControl.value || !this.timeControl.value;
      case 'date':
        return !this.dateControl.value;
      case 'time':
        return !this.timeControl.value;
      case 'dateTimeRange':
        return (
          !this.rangeDateControl.value?.start ||
          !this.rangeDateControl.value?.end ||
          !this.rangeTimeFromControl.value ||
          !this.rangeTimeToControl.value
        );
      case 'dateRange':
        return !this.rangeDateControl.value?.start || !this.rangeDateControl.value?.end;
      case 'timeRange':
        return !this.rangeTimeFromControl.value || !this.rangeTimeToControl.value;
    }
  }

  ngOnInit(): void {
    this.#initState();
  }

  onConfirm(): void {
    const values = this.#setPickerValue();
    this.dialogRef.close(values);
  }

  onSelectedRangeChange(date: Date): void {
    const rangeDateValue = this.rangeDateControl.value;

    rangeDateValue && rangeDateValue.start && date >= rangeDateValue.start && !rangeDateValue.end
      ? this.rangeDateControl.setValue(
          new DateRange(rangeDateValue.start, DateTime.fromJSDate(date).endOf('day').toJSDate())
        )
      : this.rangeDateControl.setValue(new DateRange(date, null));
  }

  #initState(): void {
    const { dateFormatted, rangeStart, rangeEnd, time, pickerType } = this.dialogConfig.data;

    switch (pickerType) {
      case 'dateTime':
        return this.#setDateControls(dateFormatted);
      case 'date': {
        if (!dateFormatted) return;
        return this.dateControl.setValue(this.#dateFormattedToJSDate(dateFormatted));
      }
      case 'time':
        return this.timeControl.setValue(time);
      case 'dateTimeRange':
        return this.#setDateTimeRangeControls(rangeStart, rangeEnd);
      case 'dateRange':
        return this.#setDateRangeControls(rangeStart, rangeEnd);
      case 'timeRange': {
        this.rangeTimeFromControl.setValue(rangeStart);
        this.rangeTimeToControl.setValue(rangeEnd);
        return;
      }
    }
  }

  #setPickerValue(): Partial<DateTimePicker> {
    const { pickerType } = this.dialogConfig.data;

    switch (pickerType) {
      case 'dateTime': {
        const [hour, minute] = this.#getHourAndMinute(this.timeControl.value!);
        return {
          date: this.#createDateWithTime(this.dateControl.value!, hour, minute),
        };
      }
      case 'date':
        return { date: this.dateControl.value! };
      case 'time':
        return { time: this.timeControl.value! };
      case 'dateTimeRange': {
        const [hourFrom, minuteFrom] = this.#getHourAndMinute(this.rangeTimeFromControl.value!);
        const [hourTo, minuteTo] = this.#getHourAndMinute(this.rangeTimeToControl.value!);
        const dateStart = this.#createDateWithTime(this.rangeDateControl.value!.start!, hourFrom, minuteFrom);
        const dateEnd = this.#createDateWithTime(this.rangeDateControl.value!.end!, hourTo, minuteTo);

        return { rangeDate: new DateRange(dateStart, dateEnd) };
      }
      case 'dateRange':
        return { rangeDate: this.rangeDateControl.value! };
      case 'timeRange':
        return {
          rangeStart: this.rangeTimeFromControl.value!,
          rangeEnd: this.rangeTimeToControl.value!,
        };
    }
  }

  #separateTimeFromDate(value: string): [Date, string] {
    const dateTime = DateTime.fromFormat(value, dateTimeFormat);
    const time = dateTime.toFormat('HH:mm');
    return [dateTime.toJSDate(), time];
  }

  #createDateWithTime(date: Date, hour: number, minute: number): Date {
    return DateTime.fromJSDate(date).set({ hour, minute }).toJSDate();
  }

  #getHourAndMinute(time: string): [number, number] {
    const dateTime = DateTime.fromFormat(time, 'HH:mm');
    return [dateTime.hour, dateTime.minute];
  }

  #setDateControls(value?: string): void {
    if (!value) return;

    const [date, time] = this.#separateTimeFromDate(value);
    this.dateControl.setValue(date);
    this.timeControl.setValue(time);
  }

  #setDateTimeRangeControls(rangeStart?: string, rangeEnd?: string): void {
    if (!rangeStart || !rangeEnd) return;

    const [dateStart, timeStart] = this.#separateTimeFromDate(rangeStart);
    const [dateEnd, timeEnd] = this.#separateTimeFromDate(rangeEnd);

    this.rangeDateControl.setValue(new DateRange<Date>(dateStart, dateEnd));
    this.rangeTimeFromControl.setValue(timeStart);
    this.rangeTimeToControl.setValue(timeEnd);
  }

  #setDateRangeControls(rangeStart?: string, rangeEnd?: string): void {
    if (!rangeStart || !rangeEnd) return;

    const rangeDateStart = this.#dateFormattedToJSDate(rangeStart);
    const rangeDateEnd = this.#dateFormattedToJSDate(rangeEnd);

    this.rangeDateControl.setValue(new DateRange<Date>(rangeDateStart, rangeDateEnd));
  }

  #dateFormattedToJSDate(formatted: string, format = dateFormat): Date {
    return DateTime.fromFormat(formatted, format).toJSDate();
  }
}

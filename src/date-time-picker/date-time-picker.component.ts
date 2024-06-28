import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  Optional,
  Self,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgClass } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { DateRange } from '@angular/material/datepicker';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DateTime } from 'luxon';
import { filter, noop, take, tap } from 'rxjs';
import { DATE_FORMAT as dateFormat, DATE_TIME_FORMAT as dateTimeFormat } from './util/config/date-time-picker-format';
import { DateTimePickerType } from './util/types/date-time-picker-type.type';
import { DateTimePicker } from './util/types/date-time-picker.type';
import { TimeRangePicker } from './util/types/time-range-picker.type';
import { DateTimePickerDialog } from './util/types/date-time-picker-dialog.type';
import { DateTimePickerDialogComponent } from './components/date-time-picker-dialog.component';

@Component({
  selector: 'date-time-picker',
  standalone: true,
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    ReactiveFormsModule,
    NgClass,
    MatError,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './date-time-picker.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateTimePickerComponent implements ControlValueAccessor {
  #dialog = inject(MatDialog);

  pickerType = input<DateTimePickerType>('dateTime');
  customClass = input<string>('');
  isLabelFloating = input<boolean>(true);
  isLabelAbove = input<boolean>(false);
  isReadonly = input<boolean>(true);
  placeholder = input<string>('');
  label = input<string>('');
  maxDate = input<Date | null>(null);
  minDate = input<Date | null>(null);
  dialogTitle = input<string | null>(null);

  #initLabelEffect = effect(() => {
    const label = this.label();

    untracked(() => this.labelTemplate.set(label));
  });

  labelTemplate = signal('');

  pickerControl = new FormControl<string>('');

  constructor(@Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  isRequiredValidator = computed<boolean>(() => !!this.ngControl?.control?.hasValidator(Validators.required));

  isRequired = computed<'*' | ''>(() =>
    (this.isRequiredValidator() && this.isLabelAbove()) || (this.isRequiredValidator() && this.isLabelFloating())
      ? '*'
      : ''
  );

  isFloatingLabel = computed<boolean>(() => {
    if (this.isLabelAbove() && !this.isLabelFloating()) return false;

    if (!this.isLabelAbove() && !this.isLabelFloating()) {
      this.labelTemplate.set('');
      return false;
    }

    return true;
  });

  iconPicker = computed<string>(() => {
    switch (this.pickerType()) {
      case 'dateTime':
        return 'calendar_clock';
      case 'time':
      case 'timeRange':
        return 'schedule';
      case 'dateTimeRange':
      case 'dateRange':
        return 'date_range';
      case 'date':
        return 'today';
    }
  });

  get timeRangeError(): string {
    const timeOutOfRange = this.ngControl.control?.getError('timeOutOfRange');
    return `Wprowadzony czas nie mieści się w wymaganym zakresie. ${timeOutOfRange.min} - ${timeOutOfRange.max}`;
  }

  openDialog(): void {
    this.#dialog
      .open(DateTimePickerDialogComponent, this.#getDialogConfig())
      .afterClosed()
      .pipe(
        take(1),
        filter(values => !!values),
        tap((values: Partial<DateTimePicker>) => {
          this.#onChangePicker(values);
          this.updateValidators();
        })
      )
      .subscribe(noop);
  }

  onTouched = () => {};

  updateValidators(): void {
    this.ngControl.control?.errors && this.pickerControl.setErrors(this.ngControl.control.errors);
  }

  writeValue(value: string | DateRange<Date> | Date | TimeRangePicker): void {
    if (!value) return;

    let pickerValue = null;

    switch (this.pickerType()) {
      case 'dateTime':
        pickerValue = this.#formattedDate(value as Date, dateTimeFormat);
        break;
      case 'date':
        pickerValue = this.#formattedDate(value as Date);
        break;
      case 'time':
        pickerValue = value as string;
        break;
      case 'dateTimeRange':
        pickerValue = this.#formattedDateForRange(value as DateRange<Date>, dateTimeFormat);
        break;
      case 'dateRange':
        pickerValue = this.#formattedDateForRange(value as DateRange<Date>);
        break;
      case 'timeRange':
        pickerValue = this.#formattedTimeRange(value as TimeRangePicker);
    }

    this.pickerControl.setValue(pickerValue);
  }

  registerOnChange(fn: (value: Date | DateRange<Date> | TimeRangePicker | string | null) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.pickerControl.disable() : this.pickerControl.enable();
  }

  #onChange: (value: Date | DateRange<Date> | TimeRangePicker | string | null) => void | null = () => null;

  #onChangePicker(values: DateTimePicker): void {
    switch (this.pickerType()) {
      case 'dateTime':
        return this.#onChangeDate(values.date!, dateTimeFormat);
      case 'date':
        return this.#onChangeDate(values.date!);
      case 'time':
        return this.#onChangeTime(values.time!);
      case 'dateTimeRange':
        return this.#onChangeDateRange(values.rangeDate!, dateTimeFormat);
      case 'dateRange':
        return this.#onChangeDateRange(values.rangeDate!);
      case 'timeRange':
        return this.#onChangeTimeRange({
          startTime: values.rangeStart!,
          endTime: values.rangeEnd!,
        });
    }
  }

  #onChangeDate(selectedDate: Date, format?: string): void {
    this.pickerControl.setValue(this.#formattedDate(selectedDate, format));
    this.#onChange(selectedDate);
  }

  #onChangeTime(selectedTime: string): void {
    this.pickerControl.setValue(selectedTime);
    this.#onChange(selectedTime);
  }

  #onChangeDateRange(selectedDate: DateRange<Date>, format?: string): void {
    this.pickerControl.setValue(this.#formattedDateForRange(selectedDate, format));
    this.#onChange(selectedDate);
  }

  #onChangeTimeRange(time: TimeRangePicker): void {
    this.pickerControl.setValue(this.#formattedTimeRange(time));
    this.#onChange({ startTime: time.startTime, endTime: time.endTime });
  }

  #getDialogConfig(): MatDialogConfig<DateTimePickerDialog> {
    return {
      data: {
        title: this.dialogTitle() ?? this.#getDialogTitleConfig(),
        data: {
          ...this.#getDialogDataConfig(this.pickerControl.value),
          pickerType: this.pickerType(),
          maxDate: this.maxDate(),
          minDate: this.minDate(),
        },
      },
    };
  }

  #getDialogDataConfig(value: string | null): Partial<DateTimePicker> | null {
    if (!value) return null;

    switch (this.pickerType()) {
      case 'dateTime':
      case 'date':
        return { dateFormatted: value };
      case 'time':
        return { time: value };
      case 'dateTimeRange':
      case 'dateRange':
      case 'timeRange':
        return this.#getRangeConfig(value);
    }
  }

  #getDialogTitleConfig(): string {
    switch (this.pickerType()) {
      case 'dateTime':
        return 'Ustaw datę i godzinę';
      case 'date':
        return 'Ustaw datę';
      case 'time':
        return 'Ustaw czas';
      case 'dateTimeRange':
      case 'dateRange':
        return 'Ustaw zakres';
      case 'timeRange':
        return 'Ustaw zakres czasu';
    }
  }

  #getRangeConfig(value: string): Partial<DateTimePicker> {
    const [start, end] = value.split('-');
    return { rangeStart: start.trim(), rangeEnd: end.trim() };
  }

  #formattedDate(date: Date, format = dateFormat): string {
    return DateTime.fromJSDate(date).toFormat(format);
  }

  #formattedDateForRange(date: DateRange<Date>, format?: string): string {
    return `${this.#formattedDate(date.start!, format)} - ${this.#formattedDate(date.end!, format)}`;
  }

  #formattedTimeRange(time: TimeRangePicker): string {
    return `${time.startTime} - ${time.endTime}`;
  }
}

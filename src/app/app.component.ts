import { Component } from '@angular/core';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DateRange } from '@angular/material/datepicker';
import { timeFromIsGreaterThanTimeToValidator } from '../date-time-picker/validators/time-from-is-greater-than-time-to-validator';
import { timeRangeValidator } from '../date-time-picker/validators/time-range-validator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DateTimePickerComponent, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  dateTimePickerControl = new FormControl<string | null>(null);
  datePickerControl = new FormControl<string | null>(null);
  dateTimeRangePickerControl = new FormControl<DateRange<Date> | null>(null);
  timePickerControl = new FormControl<string | null>(null);
  dateRangePickerControl = new FormControl<DateRange<Date> | null>(null);
  timeRangePickerControl = new FormControl<{ startTime: string; endTime: string } | null>(null, [
    timeFromIsGreaterThanTimeToValidator(),
    timeRangeValidator('08:00', '20:00'),
  ]);
}

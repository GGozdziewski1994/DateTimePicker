# DateTimePicker

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Picker Component

The component offers a versatile and intuitive date and time selection tool. The component supports six variants

* date
* dateTime
* time
* timeRange
* dateRange
* dateTimeRange

### Key features

* `Integration with Angular Material`: Uses the calendar from Angular Material for date selection.
* `HTML Time Input`: Uses a standard HTML time element to select a time.
* `ControlValueAccessor`: Implements the ControlValueAccessor interface so it works seamlessly with ReactiveForms in Angular.
* `Future-proof`: Designed to remain compatible with future Angular updates by using standard Angular Material components and HTML elements.

### Usage

```
<date-time-picker
  [formControl]="dateTimeRangePickerControl"
  customClass="w-full"
  pickerType="dateTimeRange"
  label="Date time range picker" />
 ```

### Inputs

* pickerType: `dateTime | time | dateTimeRange | dateRange | date | timeRange`
* customClass: `string`
* isLabelFloating: `boolean`
* isLabelAbove: `boolean`
* isReadonly: `boolean`
* placeholder: `string`
* label: `string`
* maxDate: `Date | null`
* minDate: `Date | null`
* dialogTitle: `string | null`

### Summary 

This Date Time Picker component is a flexible and robust solution for selecting dates and times in Angular applications. By using Angular Material and standard HTML elements, it ensures compatibility and ease of use even as Angular evolves. Its implementation as a `ControlValueAccessor` makes it integrate naturally with `ReactiveForms`



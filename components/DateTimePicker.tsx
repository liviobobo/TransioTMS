import React, { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ro } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

// Înregistrează locale română
registerLocale('ro', ro)

interface DateTimePickerProps {
  selected?: Date | null
  onChange: (date: Date | null) => void
  showTimeSelect?: boolean
  timeFormat?: string
  dateFormat?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
}

// Custom input cu styling Transio
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, className, error }, ref) => (
  <input
    className={`input ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''} ${className || ''}`}
    onClick={onClick}
    value={value}
    placeholder={placeholder}
    readOnly
    ref={ref}
  />
))

CustomInput.displayName = 'CustomInput'

export const DateOnlyPicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  placeholder = "zz/ll/aaaa",
  className,
  disabled = false,
  required = false,
  error = false
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      locale="ro"
      placeholderText={placeholder}
      disabled={disabled}
      customInput={<CustomInput className={className} error={error} />}
      popperClassName="z-50"
      showPopperArrow={false}
    />
  )
}

export const TimeOnlyPicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  placeholder = "00:00 (24h)",
  className,
  disabled = false,
  required = false,
  error = false
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Ora"
      timeFormat="HH:mm"
      dateFormat="HH:mm"
      locale="ro"
      placeholderText={placeholder}
      disabled={disabled}
      customInput={<CustomInput className={className} error={error} />}
      popperClassName="z-50"
      showPopperArrow={false}
    />
  )
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  placeholder = "zz/ll/aaaa 00:00",
  className,
  disabled = false,
  required = false,
  error = false
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Ora"
      dateFormat="dd/MM/yyyy HH:mm"
      locale="ro"
      placeholderText={placeholder}
      disabled={disabled}
      customInput={<CustomInput className={className} error={error} />}
      popperClassName="z-50"
      showPopperArrow={false}
    />
  )
}

// Definire type pentru DateTimePicker cu proprietăți statice
type DateTimePickerComponent = React.FC<DateTimePickerProps> & {
  DateOnly: React.FC<DateTimePickerProps>
  TimeOnly: React.FC<DateTimePickerProps>
}

// Adaugă proprietăți statice pentru acces de tip DateTimePicker.DateOnly
const DateTimePickerWithStatics = DateTimePicker as DateTimePickerComponent
DateTimePickerWithStatics.DateOnly = DateOnlyPicker
DateTimePickerWithStatics.TimeOnly = TimeOnlyPicker

export default DateTimePickerWithStatics
// src/components/StyledDatePicker.jsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StyledDatePicker = ({ selectedDate, setSelectedDate }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      dateFormat="yyyy/MM/dd"
      className="border rounded-md p-2"
      isClearable
    />
  );
};

export default StyledDatePicker;

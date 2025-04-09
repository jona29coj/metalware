import React, { createContext, useState } from 'react';
import moment from 'moment-timezone';

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(moment().tz('Asia/Kolkata').format('YYYY-MM-DD'));

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log("Selected date (IST) in Context:", moment.tz(date, 'Asia/Kolkata').format('DD MMM<ctrl98>'));
    // Any other global date-related logic can go here
  };

  return (
    <DateContext.Provider value={{ selectedDate, handleDateChange }}>
      {children}
    </DateContext.Provider>
  );
};
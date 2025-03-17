import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaCalendarCheck, FaArrowLeft, FaArrowRight } from "react-icons/fa";  // Calendar and Arrow icons

const DateSelector = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isRange, setIsRange] = useState(false);  // Toggle for date range mode

  // Adjust dates using arrow buttons
  const adjustDate = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  // Handle date changes
  const handleDateChange = (newStartDate, newEndDate) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateChange(newStartDate, newEndDate); // Notify parent about date changes
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Icon-based Toggle for Single Date or Date Range */}
      <button
        onClick={() => setIsRange(!isRange)}
        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
        title={isRange ? "Select Range" : "Select Date"} // Tooltip for better accessibility
      >
        {isRange ? <FaCalendarCheck size={20} /> : <FaCalendarAlt size={20} />}
      </button>

      {/* Single Date Picker */}
      {!isRange ? (
        <div className="flex items-center space-x-1">
          <FaArrowLeft
            className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
            onClick={() =>
              setStartDate((prev) => (prev ? adjustDate(prev, -1) : new Date()))
            }
          />
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChange(date, null)}
            className="w-24 text-xs px-2 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholderText="Select Date"
            dateFormat="dd/MM/yyyy"
          />
          <FaArrowRight
            className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
            onClick={() =>
              setStartDate((prev) => (prev ? adjustDate(prev, 1) : new Date()))
            }
          />
        </div>
      ) : (
        // Date Range Picker
        <div className="flex items-center space-x-2">
          {/* Start Date Picker */}
          <div className="flex items-center space-x-1">
            <FaArrowLeft
              className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
              onClick={() =>
                setStartDate((prev) => (prev ? adjustDate(prev, -1) : new Date()))
              }
            />
            <DatePicker
              selected={startDate}
              onChange={(date) => handleDateChange(date, endDate)}
              className="w-24 text-xs px-2 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Start Date"
              dateFormat="dd/MM/yyyy"
            />
            <FaArrowRight
              className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
              onClick={() =>
                setStartDate((prev) => (prev ? adjustDate(prev, 1) : new Date()))
              }
            />
          </div>

          {/* End Date Picker */}
          <div className="flex items-center space-x-1">
            <FaArrowLeft
              className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
              onClick={() =>
                setEndDate((prev) => (prev ? adjustDate(prev, -1) : new Date()))
              }
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => handleDateChange(startDate, date)}
              className="w-24 text-xs px-2 py-1 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholderText="End Date"
              dateFormat="dd/MM/yyyy"
              minDate={startDate}
            />
            <FaArrowRight
              className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm"
              onClick={() =>
                setEndDate((prev) => (prev ? adjustDate(prev, 1) : new Date()))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateSelector;

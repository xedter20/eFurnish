import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import Calendar from 'react-calendar'; // Import Calendar

import Datepicker from "react-tailwindcss-datepicker";
import moment from 'moment-timezone'; // Import moment-timezone

export default function DateRangeFilter({ onFilterChange,
  setDateRange }) {
  const [selectedDate, setValue] = useState({
    start: new Date(),
    end: new Date(),
  });

  const handleValueChange = (newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const { startDate, endDate } = selectedDate;
    if (startDate && endDate) {
      onFilterChange(startDate, endDate);
    }
  }, [selectedDate, onFilterChange]);

  // Predefined date ranges
  const dateRanges = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
  ];

  const handleQuickSelect = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    setValue({
      startDate: start,
      endDate: end
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        {dateRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleQuickSelect(range.value)}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors
              hover:bg-base hover:text-white bg-base/5 text-base"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="relative">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <CalendarIcon className="w-5 h-5 text-base" />
          <Datepicker
            value={selectedDate}
            onChange={handleValueChange}
            showShortcuts={true}
            primaryColor="rgb(186, 138, 91)" // Your base color
            inputClassName="w-full text-sm font-medium text-gray-700 focus:outline-none"
            containerClassName="relative w-full"
            toggleClassName="absolute right-0 px-3 py-2 text-gray-400 focus:outline-none"
            toggleIcon={() => <ChevronDown className="w-4 h-4" />}
            popoverDirection="down"
            startWeekOn="monday"
            separator="to"
            displayFormat="MMM DD, YYYY"
            readOnly={true}
            popoverClassName="bg-white shadow-lg rounded-lg border border-gray-200 mt-2"
            i18n={{
              shortcutLabels: {
                today: "Today",
                yesterday: "Yesterday",
                past: (days) => `Past ${days} days`,
                currentMonth: "Current Month",
                pastMonth: "Past Month",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

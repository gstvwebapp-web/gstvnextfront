'use client';

import React, { useState, useEffect } from 'react';
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD, getCurrentDateYYYYMMDD } from '@/services/epaperApi';

interface EpaperCalendarProps {
  currentDate?: string; // DD-MM-YYYY format
  onDateChange?: (date: string) => void; // DD-MM-YYYY format
}

const EpaperCalendar: React.FC<EpaperCalendarProps> = ({
  currentDate,
  onDateChange
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (currentDate) {
      // Convert DD-MM-YYYY to YYYY-MM-DD for input
      const inputDate = formatDateToYYYYMMDD(currentDate);
      setSelectedDate(inputDate);
    } else {
      setSelectedDate(getCurrentDateYYYYMMDD());
    }
  }, [currentDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value; // YYYY-MM-DD format
    setSelectedDate(newDate);

    if (newDate) {
      const formattedDate = formatDateToDDMMYYYY(newDate); // Convert to DD-MM-YYYY

      if (onDateChange) {
        onDateChange(formattedDate);
      }
    }
  };

  const toggleCalendar = () => {
    // Trigger the hidden date input
    const dateInput = document.getElementById('datepicker') as HTMLInputElement;
    if (dateInput) {
      if (dateInput.showPicker) {
        dateInput.showPicker();
      } else {
        dateInput.focus();
      }
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  return (
    <div className="datePicker datepicketdate">
      <div className="date-picker-wrapper">
        <input
          type="date"
          id="datepicker"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-input"
          max={getCurrentDateYYYYMMDD()} // Prevent future dates
        />
      </div>
    </div>
  );
};

export default EpaperCalendar;

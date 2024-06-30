import React, { useRef, useEffect } from "react";
import HotelDatepicker from "hotel-datepicker";
import "hotel-datepicker/dist/css/hotel-datepicker.css";
import { format, startOfDay, eachDayOfInterval } from "date-fns";
import uniq from "lodash.uniq";

const DatePicker = ({
  maxDate,
  dateRange,
  disabledDateRanges,
  onChange,
  disabled,
}) => {
  const randomId = useRef(
    `hotel-datepicker-${Math.random().toString(36).substring(7)}`
  );
  const disabledDates = uniq(
    disabledDateRanges.flatMap((range) =>
      eachDayOfInterval(range).map((date) => format(date, "yyyy-MM-dd"))
    )
  ).sort();

  useEffect(() => {
    const datepicker = new HotelDatepicker(
      document.getElementById(randomId.current),
      {
        // Format as e.g. "Sat 6th Jan"
        format: "ddd Do MMM",
        minNights: 1,
        maxNights: 15,
        startDate: new Date(),
        endDate: maxDate,
        disabledDates,
        enableCheckout: true,
        moveBothMonths: true,

        onSelectRange: () => onChange([datepicker.start, datepicker.end]),
      }
    );

    if (dateRange.start && dateRange.end) {
      datepicker.setRange(
        startOfDay(dateRange.start),
        startOfDay(dateRange.end)
      );
    }

    return () => {
      datepicker.destroy();
    };
  }, [
    format(maxDate, "yyyy-MM-dd"),
    dateRange.start,
    dateRange.end,
    onChange,
    JSON.stringify(disabledDates),
  ]);

  return <input id={randomId.current} type="text" disabled={disabled} />;
};

export default DatePicker;

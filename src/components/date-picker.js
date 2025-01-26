import React, { useRef, useState, useEffect } from "react";
import HotelDatepicker from "hotel-datepicker";
import "hotel-datepicker/dist/css/hotel-datepicker.css";
import { format, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import uniq from "lodash.uniq";

const DatePicker = ({
  maxDate,
  dateRange,
  disabledDateRanges,
  onChange,
  disabled,
  value,
  hotelDatePickerProps = {},
  ...props
}) => {
  const randomId = useRef(
    `hotel-datepicker-${Math.random().toString(36).substring(7)}`
  );
  const [pendingClick, setPendingClick] = useState(false);
  const disabledDates = uniq(
    disabledDateRanges.flatMap(({ start, end }) =>
      eachDayOfInterval({
        start,
        // we don't want to include the end date in the disabled range, since it's the checkout date
        end: subDays(end, 1),
      }).map((date) => format(date, "yyyy-MM-dd"))
    )
  ).sort();

  useEffect(() => {
    const domNode = document.getElementById(randomId.current);
    const datepicker = new HotelDatepicker(domNode, {
      // Format as e.g. "Sat 6th Jan"
      format: "ddd Do MMM",
      minNights: 1,
      maxNights: 15,
      startDate: new Date(),
      endDate: maxDate,
      disabledDates,
      enableCheckout: true,
      moveBothMonths: true,
      ...(value
        ? {
            setValue: () => {
              console.log("set to value", value);
              domNode.value = value;
            },
          }
        : {}),
      ...hotelDatePickerProps,

      onSelectRange: () => onChange([datepicker.start, datepicker.end]),
    });

    if (dateRange.start && dateRange.end) {
      datepicker.setRange(
        startOfDay(dateRange.start),
        startOfDay(dateRange.end)
      );
    }

    return () => {
      datepicker.destroy();
      domNode.value = value || "";
    };
  }, [
    format(maxDate, "yyyy-MM-dd"),
    dateRange.start,
    dateRange.end,
    onChange,
    JSON.stringify(disabledDates),
  ]);

  const onClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      setPendingClick(true);
    }
  };

  useEffect(() => {
    if (value) {
      const domNode = document.getElementById(randomId.current);
      domNode.value = value;
    }
  }, [value]);

  useEffect(() => {
    if (pendingClick) {
      setPendingClick(false);
      document.getElementById(randomId.current).click();
    }
  }, [disabled]);

  return (
    <div style={{ display: "flex", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: disabled ? "block" : "none",
          opacity: pendingClick ? 0.3 : 0,
          transition: "opacity 2s ease",
          background: "#000",
        }}
        onClick={onClick}
      />

      <input id={randomId.current} type="text" value={value} {...props} />
    </div>
  );
};

export default DatePicker;

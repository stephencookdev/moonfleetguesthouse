import { useState, useEffect } from "react";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const useAvailability = ({ dateRange, room, numberOfGuests }) => {
  const [busyDates, setBusyDates] = useState([]);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    if (dateRange?.start && dateRange?.end) {
      const fetchAvailability = async () => {
        const widerDateStart = new Date(
          Math.max(
            new Date(),
            new Date(dateRange.start).getTime() - 30 * DAY_IN_MS
          )
        );
        const widerDateEnd = new Date(
          Math.max(
            widerDateStart.getTime() + 30 * DAY_IN_MS,
            new Date(dateRange.end).getTime() + 30 * DAY_IN_MS
          )
        );
        const widerDateRange = {
          start: widerDateStart,
          end: widerDateEnd,
        };

        const availabilityResponse = await fetch("/api/check-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRange: widerDateRange,
            room,
          }),
        });

        const { busyDates } = await availabilityResponse.json();
        setBusyDates(busyDates || []);

        const priceResponse = await fetch("/api/get-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRange,
            numberOfGuests,
            room,
          }),
        });

        const { price } = await priceResponse.json();
        setPrice(price || null);
      };

      fetchAvailability();
    }
  }, [dateRange?.start, dateRange?.end, room]);

  return { busyDates, price };
};

export default useAvailability;

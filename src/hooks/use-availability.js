import { useState, useEffect } from "react";
import { format } from "date-fns";

const useAvailability = ({ maxDate, room }) => {
  const [busyDates, setBusyDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!room) return;

    const fetchAvailability = async () => {
      setIsLoading(true);

      const dateRange = {
        start: new Date(),
        end: maxDate,
      };

      const availabilityResponse = await fetch(
        "/.netlify/functions/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dateRange, room }),
        }
      );

      const { busyDates } = await availabilityResponse.json();
      setBusyDates(busyDates || []);

      setIsLoading(false);
    };

    fetchAvailability();
  }, [format(maxDate, "yyyy-MM-dd"), room]);

  return { busyDates, isLoading };
};

export default useAvailability;

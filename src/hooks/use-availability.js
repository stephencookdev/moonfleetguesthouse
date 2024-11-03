import { useState, useEffect } from "react";
import { format } from "date-fns";

const useAvailability = ({ minDate = new Date(), maxDate, rooms }) => {
  const [roomToBusyDates, setRoomToBusyDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!rooms?.filter(Boolean)?.length) return;

    const fetchAvailability = async () => {
      setIsLoading(true);

      const dateRange = {
        start: minDate,
        end: maxDate,
      };

      const roomToBusyDates = Object.fromEntries(
        await Promise.all(
          rooms.map(async (room) => {
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

            return [
              room,
              busyDates.map(({ start, end }) => ({
                start: new Date(start),
                end: new Date(end),
              })),
            ];
          })
        )
      );

      setRoomToBusyDates(roomToBusyDates || []);

      setIsLoading(false);
    };

    fetchAvailability();
  }, [
    format(minDate, "yyyy-MM-dd"),
    format(maxDate, "yyyy-MM-dd"),
    JSON.stringify(rooms.sort()),
  ]);

  return { roomToBusyDates, isLoading };
};

export default useAvailability;

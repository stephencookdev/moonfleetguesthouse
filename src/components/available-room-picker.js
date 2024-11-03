import React from "react";
import PropTypes from "prop-types";
import { addDays, startOfDay, format } from "date-fns";
import useAvailability from "../hooks/use-availability";
import BookNow from "./book-now";
import DatePicker from "./date-picker";
import * as styles from "./available-room-picker.module.css";

const Room = ({
  name,
  image,
  normalPrice,
  saturdayPrice,
  tagline,
  dateRange,
}) => (
  <div key={name} className={styles.room}>
    <h2>{name}</h2>
    <p className={styles.description}>{tagline}</p>
    <p>
      Sun-Fri inc. Breakfast <span className={styles.price}>{normalPrice}</span>
    </p>
    <p>
      Saturday inc. Breakfast{" "}
      <span className={styles.price}>{saturdayPrice}</span>
    </p>
    <img src={image.replace("/assets/", "/assets-thumbnails/")} alt="" />
    <BookNow room={name} dateRange={dateRange} className={styles.cta}>
      Book Now
    </BookNow>
  </div>
);

Room.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  normalPrice: PropTypes.string,
  saturdayPrice: PropTypes.string,
  tagline: PropTypes.string,
  dateRange: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
    end: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]),
  }),
};

const camelCase = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/, "_");

const AvailableRoomPicker = ({ allRooms }) => {
  const maxDate = startOfDay(addDays(new Date(), 365));
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const { roomToBusyDates, isLoading: isBusyDatesLoading } = useAvailability({
    maxDate,
    rooms: allRooms.map(({ name }) => camelCase(name)),
  });
  const busyForEveryRoomDates = Object.values(roomToBusyDates).reduce(
    (acc, dates) => {
      return acc
        .flatMap((accRange) => {
          return dates
            ?.map((dateRange) => {
              const start = new Date(Math.max(accRange.start, dateRange.start));
              const end = new Date(Math.min(accRange.end, dateRange.end));

              // Only keep ranges that have a valid overlap
              if (start <= end) {
                return { start, end };
              }
              return null;
            })
            .filter(Boolean);
        })
        .filter(Boolean);
    },
    [
      {
        start: new Date(),
        end: maxDate,
      },
    ]
  );

  const availableRooms =
    startDate && endDate
      ? allRooms.filter((room) => {
          const roomSlug = camelCase(room.name);
          const busyDates = roomToBusyDates[roomSlug] || [];
          return !busyDates.some(({ start, end }) => {
            return (
              (start < endDate && end > startDate) ||
              (startDate < end && endDate > start)
            );
          });
        })
      : allRooms;

  const datePickerValue =
    startDate && endDate
      ? `Showing rooms available between ${format(
          startDate,
          "eee do MMM"
        )} and ${format(endDate, "eee do MMM")}`
      : "Filter by date";

  return (
    <>
      <div className={styles.filter}>
        <DatePicker
          maxDate={maxDate}
          dateRange={{ start: startDate, end: endDate }}
          onChange={([start, end]) => {
            setStartDate(start);
            setEndDate(end);
          }}
          disabledDateRanges={busyForEveryRoomDates}
          disabled={isBusyDatesLoading}
          type="button"
          value={datePickerValue}
        />
        {startDate && endDate ? (
          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          >
            Clear date filter
          </button>
        ) : null}
      </div>

      {availableRooms.length > 0 ? (
        availableRooms.map((room) => (
          <Room
            key={room.name}
            {...room}
            dateRange={
              startDate && endDate ? { start: startDate, end: endDate } : null
            }
          />
        ))
      ) : (
        <div>No rooms available in those dates</div>
      )}
    </>
  );
};

AvailableRoomPicker.propTypes = {
  allRooms: PropTypes.arrayOf(PropTypes.shape(Room.propTypes)),
};

export default AvailableRoomPicker;

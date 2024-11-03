const {
  roomToCalendarId,
  getUKTime,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
  fetchAllBusyDates,
} = require("../utils/utils");

exports.handler = async (event) => {
  try {
    const { dateRange, room } = JSON.parse(event.body);

    const calendarId = roomToCalendarId(room);

    const eventStartTime = getUKTime(dateRange.start, CHECK_IN_HOUR, 0);
    const eventEndTime = getUKTime(dateRange.end, CHECK_OUT_HOUR, 0);

    // Check if a calendar entry already exists
    const busyDates = await fetchAllBusyDates({
      calendarId,
      timeMin: eventStartTime,
      timeMax: eventEndTime,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ busyDates }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

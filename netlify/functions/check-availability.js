const { google } = require("googleapis");
const {
  roomToCalendarId,
  getUKTime,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
} = require("../utils/utils");

const calendar = google.calendar("v3");

const serviceAccount = JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_JSON);
const googleCalendarAuth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/calendar"]
);

exports.handler = async (event) => {
  try {
    const { dateRange, room } = JSON.parse(event.body);

    const calendarId = roomToCalendarId(room);

    const eventStartTime = getUKTime(dateRange.start, CHECK_IN_HOUR, 0);
    const eventEndTime = getUKTime(dateRange.end, CHECK_OUT_HOUR, 0);

    // Check if a calendar entry already exists
    const existingEvents = await calendar.events.list({
      auth: googleCalendarAuth,
      calendarId,
      timeMin: eventStartTime,
      timeMax: eventEndTime,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        busyDates: existingEvents.data.items.map((event) => ({
          start: event.start.dateTime,
          end: event.end.dateTime,
        })),
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

const { google } = require("googleapis");
const ical = require("node-ical");
const { addDays, startOfDay } = require("date-fns");
const {
  ROOM_SLUGS,
  roomToCalendarId,
  roomToExternalCalendarData,
  fetchAllBusyDates,
} = require("../utils/utils");

const calendar = google.calendar("v3");

const serviceAccount = JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_JSON);
const googleCalendarAuth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/calendar"]
);

async function syncExternalCalendar({ calendarId, icsUrl, source, busyDates }) {
  const icsContents = await (await fetch(icsUrl)).text();
  const icsEvents = Object.values(ical.sync.parseICS(icsContents))
    .filter((event) => event.type === "VEVENT")
    .map((event) => ({
      start: event.start,
      end: event.end,
      summary: `[${source}]: ${event.summary} (${event.uid})`,
    }));

  const matchingBusyDates = icsEvents.filter((icsEv) =>
    busyDates.some((dateEv) => dateEv.summary === icsEv.summary)
  );
  const mismatchedDates = matchingBusyDates.filter(
    (icsEv) =>
      !busyDates.some(
        (dateEv) =>
          dateEv.start === icsEv.start &&
          dateEv.end === icsEv.end &&
          dateEv.summary === icsEv.summary
      )
  );

  const newDates = icsEvents.filter(
    (icsEv) =>
      !matchingBusyDates.some((dateEv) => dateEv.summary === icsEv.summary)
  );

  console.log("TODO");
  console.log("Update", mismatchedDates);

  await Promise.all(
    newDates.map(async (icsEvent) => {
      await calendar.events.insert({
        auth: googleCalendarAuth,
        calendarId,
        resource: {
          summary: icsEvent.summary,
          description: "From external calendar",
          start: {
            dateTime: icsEvent.start,
          },
          end: {
            dateTime: icsEvent.end,
          },
          attendees: [],
        },
      });
    })
  );
}

exports.handler = async (event) => {
  try {
    await Promise.all(
      ROOM_SLUGS.map(async (roomSlug) => {
        const calendarId = roomToCalendarId(roomSlug);
        const externalCalendarData = roomToExternalCalendarData(roomSlug);
        for (const { icsUrl, source } of externalCalendarData) {
          const busyDates = await fetchAllBusyDates({
            calendarId,
            timeMin: new Date(),
            timeMax: startOfDay(addDays(new Date(), 365)),
          });
          await syncExternalCalendar({ calendarId, icsUrl, source, busyDates });
        }
      })
    );

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

const { google } = require("googleapis");
const ical = require("node-ical");
const { addDays, startOfDay, subDays } = require("date-fns");
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

async function syncExternalCalendar({
  calendarId,
  icsUrl,
  source,
  busyDates,
  timeMin,
  timeMax,
}) {
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

  const newDates = icsEvents.filter(
    (icsEv) =>
      !matchingBusyDates.some((dateEv) => dateEv.summary === icsEv.summary)
  );

  const allExistingEventsBySource = (
    (
      await calendar.events.list({
        auth: googleCalendarAuth,
        calendarId,
        q: `[${source}]`,
        start: timeMin,
        end: timeMax,
      })
    )?.data?.items || []
  ).map((event) => event.id);

  // Upload new events
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

  console.log("Deleted events", allExistingEventsBySource);

  // Delete old events
  await Promise.all(
    allExistingEventsBySource.map(async (eventId) => {
      await calendar.events.delete({
        auth: googleCalendarAuth,
        calendarId,
        eventId,
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
        console.log("Syncing", roomSlug, calendarId, externalCalendarData);
        for (const { icsUrl, source } of externalCalendarData) {
          const timeMin = startOfDay(subDays(new Date(), 1));
          const timeMax = startOfDay(addDays(new Date(), 365));
          const busyDates = await fetchAllBusyDates({
            calendarId,
            timeMin,
            timeMax,
          });
          await syncExternalCalendar({
            calendarId,
            icsUrl,
            source,
            busyDates,
            timeMin,
            timeMax,
          });
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

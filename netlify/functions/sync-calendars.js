const { google } = require("googleapis");
const axios = require("axios");
const ical = require("node-ical");
const { addDays, startOfDay, subDays } = require("date-fns");
const {
  ROOM_SLUGS,
  roomToCalendarId,
  roomToExternalCalendarData,
} = require("../utils/utils");

const calendar = google.calendar("v3");

const serviceAccount = JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_JSON);
const googleCalendarAuth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/calendar"]
);

function generateBatchBody(requests) {
  const boundary = "batch_boundary";
  let body = "";

  requests.forEach((req, index) => {
    body += `--${boundary}\n`;
    body += `Content-Type: application/http\n`;
    body += `Content-ID: ${index + 1}\n\n`;
    body += `${req.method} ${req.url} HTTP/1.1\n`;
    body += "Content-Type: application/json; charset=UTF-8\n\n";
    if (req.body) {
      body += `${JSON.stringify(req.body)}\n\n`;
    }
  });

  body += `--${boundary}--`;

  return { body, boundary };
}

async function batchInsertEvents(calendarId, newEvents) {
  const accessToken = await googleCalendarAuth.getAccessToken();

  const requests = newEvents.map((event) => ({
    method: "POST",
    url: `/calendar/v3/calendars/${calendarId}/events`,
    body: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
    },
  }));

  const { body, boundary } = generateBatchBody(requests);

  const res = await axios.post(
    "https://www.googleapis.com/batch/calendar/v3",
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },
    }
  );

  console.log("Batch insert response:", res.status);
}

async function batchDeleteEvents(calendarId, eventIds) {
  const accessToken = await googleCalendarAuth.getAccessToken();

  const requests = eventIds.map((eventId) => ({
    method: "DELETE",
    url: `/calendar/v3/calendars/${calendarId}/events/${eventId}`,
  }));

  const { body, boundary } = generateBatchBody(requests);

  const res = await axios.post(
    "https://www.googleapis.com/batch/calendar/v3",
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": `multipart/mixed; boundary=${boundary}`,
      },
    }
  );

  console.log("Batch delete response:", res.status);
}

async function syncExternalCalendar({
  calendarId,
  icsUrl,
  source,
  timeMin,
  timeMax,
}) {
  console.log(`Starting sync of ${calendarId}`);

  const icsContents = await (await fetch(icsUrl)).text();
  const icsEvents = Object.values(ical.sync.parseICS(icsContents))
    .filter((event) => event.type === "VEVENT")
    .map((event) => ({
      start: event.start,
      end: event.end,
      summary: `[${source}]: ${event.summary} (${event.uid})`,
    }));

  const allExistingEventsBySource =
    (
      await calendar.events.list({
        auth: googleCalendarAuth,
        calendarId,
        q: `[${source}]`,
        start: timeMin,
        end: timeMax,
        maxResults: 2500,
        singleEvents: true,
      })
    )?.data?.items || [];

  const dupeEventsToOmit = allExistingEventsBySource.filter((event) =>
    icsEvents.some((icsEvent) => icsEvent.uid === event.summary)
  );

  const eventsToInsert = icsEvents
    .filter(
      (icsEvent) =>
        !dupeEventsToOmit.some((event) => event.summary === icsEvent.uid)
    )
    .map((icsEvent) => ({
      summary: icsEvent.summary,
      description: icsEvent.uid,
      start: { dateTime: icsEvent.start },
      end: { dateTime: icsEvent.end },
      attendees: [],
    }));

  const eventsToDelete = allExistingEventsBySource
    .filter(
      (event) =>
        !dupeEventsToOmit.some((dupeEvent) => dupeEvent.id === event.id)
    )
    .map((event) => event.id);

  console.log(
    `Inserting ${icsEvents.length} for ${calendarId}, including ${dupeEventsToOmit.length} potential duplicates, resulting in ${eventsToInsert.length} new events.`
  );
  console.log(
    `Deleting ${allExistingEventsBySource.length} for ${calendarId}, including ${dupeEventsToOmit.length} potential duplicates, resulting in ${eventsToDelete.length} events to delete.`
  );

  try {
    await Promise.all([
      batchInsertEvents(calendarId, eventsToInsert),
      batchDeleteEvents(calendarId, eventsToDelete),
    ]);

    console.log(`Batch operations for ${calendarId} completed successfully.`);
  } catch (error) {
    console.error(`Error during batch operations  for ${calendarId}:`, error);
  }
}

exports.handler = async () => {
  try {
    await Promise.all(
      ROOM_SLUGS.map(async (roomSlug) => {
        const calendarId = roomToCalendarId(roomSlug);
        const externalCalendarData = roomToExternalCalendarData(roomSlug);
        console.log("Syncing", roomSlug, calendarId, externalCalendarData);
        for (const { icsUrl, source } of externalCalendarData) {
          const timeMin = startOfDay(subDays(new Date(), 1));
          const timeMax = startOfDay(addDays(new Date(), 365));
          await syncExternalCalendar({
            calendarId,
            icsUrl,
            source,
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

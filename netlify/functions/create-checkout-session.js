const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mailgun = require("mailgun-js");
const { google } = require("googleapis");
const omit = require("lodash.omit");
const {
  roomToCalendarId,
  getPriceToPay,
  formatPrice,
  getUKTime,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
  roomSlugToName,
} = require("../utils/utils");

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: "moonfleetguesthouse.co.uk",
});

const calendar = google.calendar("v3");

const serviceAccount = JSON.parse(process.env.GOOGLE_CALENDAR_SERVICE_JSON);
const googleCalendarAuth = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/calendar"]
);

const objectKeysCamelCaseToTitleCase = (obj) =>
  Object.keys(obj).reduce((acc, key) => {
    const titleCasedKey = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    acc[titleCasedKey] = obj[key];
    return acc;
  }, {});

exports.handler = async (event) => {
  try {
    const { customerInfo, room } = JSON.parse(event.body);

    const calendarId = roomToCalendarId(room);
    const roomName = roomSlugToName(room);

    const eventStartTime = getUKTime(
      customerInfo.checkInDate,
      CHECK_IN_HOUR,
      0
    );
    const eventEndTime = getUKTime(
      customerInfo.checkOutDate,
      CHECK_OUT_HOUR,
      0
    );

    // Check if a calendar entry already exists
    const existingEvents = await calendar.events.list({
      auth: googleCalendarAuth,
      calendarId,
      timeMin: eventStartTime,
      timeMax: eventEndTime,
    });
    if (existingEvents.data.items.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Booking already exists for this date range",
        }),
      };
    }

    const { price, lineItems } = await getPriceToPay({
      room,
      dateRange: {
        start: eventStartTime,
        end: eventEndTime,
      },
      numberOfGuests: customerInfo.numberOfGuests,
    });
    const priceToPay = formatPrice(price);
    const singleLineNotes = customerInfo.notes.replace(/\n/g, "  ").trim();
    const customerMetadata = objectKeysCamelCaseToTitleCase({
      ...omit(customerInfo, ["email", "name", "phone", "postalCode", "notes"]),
      priceToPay,
      lineItems: lineItems
        .map(
          ({ description, price }) => `${description}: ${formatPrice(price)}`
        )
        .join("\n"),
      notes: singleLineNotes,
    });
    if (!customerMetadata.notes) {
      delete customerMetadata.notes;
    }
    const customer = await stripe.customers.create({
      email: customerInfo.email,
      name: customerInfo.name,
      phone: customerInfo.phone,
      metadata: customerMetadata,
    });
    const isTestStripeAccount =
      process.env.STRIPE_SECRET_KEY.startsWith("sk_test");
    const customerUrl = `https://dashboard.stripe.com/${
      isTestStripeAccount ? "test/" : ""
    }customers/${customer.id}`;

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });

    if (customer && setupIntent) {
      await calendar.events.insert({
        auth: googleCalendarAuth,
        calendarId,
        resource: {
          summary: `Booking for ${customerInfo.name}`,
          description: `Booking details: ${customerInfo.name}, ${
            customerInfo.email
          }, ${customerInfo.phone}\nNumber of guests: ${
            customerInfo.numberOfGuests
          }\n${customerUrl}${
            customerInfo.notes.trim()
              ? `\n\nCustomer notes: ${customerInfo.notes}`
              : ""
          }`,
          start: {
            dateTime: eventStartTime,
          },
          end: {
            dateTime: eventEndTime,
          },
          attendees: [],
        },
      });

      await mg.messages().send({
        from: "Moonfleet Guesthouse <info@moonfleetguesthouse.co.uk>",
        to: customerInfo.email,
        subject: "Booking Confirmation",
        template: "Booking Confirmation",
        "v:checkInDate": new Date(customerInfo.checkInDate).toLocaleDateString(
          "en-GB"
        ),
        "v:checkOutDate": new Date(
          customerInfo.checkOutDate
        ).toLocaleDateString("en-GB"),
        "v:room": roomName,
        "v:price": priceToPay,
        "v:lineItems": lineItems
          .map(
            ({ description, price }) => `${description}: ${formatPrice(price)}`
          )
          .join("\n"),
        "v:customerName": customerInfo.name,
        "v:bookingId": customer.id,
      });
    } else {
      throw new Error("Customer failed to create");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        customerId: customer.id,
        clientSecret: setupIntent.client_secret,
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

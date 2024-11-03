const { Temporal } = require("@js-temporal/polyfill");
const dateFns = require("date-fns");

const CHECK_IN_HOUR = 15;
const CHECK_OUT_HOUR = 10;
const SINGLE_OCCUPANCY_DISCOUNT = { percentage: 10 };
const AUGUST_EXTRA = { amount: 1000, currency: "GBP" };
const ROOM_TO_CALENDAR_ID = {
  elzevir_block:
    "a864c89beb4df2734cb5fefab8e53bd6582e909efd3d37abbe5191b5b5518c71@group.calendar.google.com",
  y_not:
    "a9b45dd28c168253fb7d137cba71f049592f6e6769c401393ac72bd175f08295@group.calendar.google.com",
  master_ratsey:
    "7fa250fb572b58629ff523ea600508bb87ec936aedd94bc774e2c729f17813bd@group.calendar.google.com",
  josephs_pit:
    "9b4699ab46c5c9781f0be00b7c8b38e950c90563fc068b539f31ffb0a8a2b8f0@group.calendar.google.com",
  the_mohune:
    "87143580ff32a8338f6c3686825a92976a6e7e1ebe20057c697634f34b8885a8@group.calendar.google.com",
  jeremy_fox:
    "95605ca8ae682fb66c60c0d8c00fe4946dd85eb167fc9724a8218d8aba659464@group.calendar.google.com",
};

const roomToCalendarId = (room) => {
  const calendarId = ROOM_TO_CALENDAR_ID[room];
  if (!calendarId) throw new Error(`Unknown room: ${room}`);
  return calendarId;
};

const roomSlugToNameObj = {
  elzevir_block: "Elzevir Block",
  y_not: "Y NOT",
  master_ratsey: "Master Ratsey",
  josephs_pit: "Joseph's Pit",
  the_mohune: "The Mohune",
  jeremy_fox: "Jeremy Fox",
};

const roomSlugToName = (slug) => {
  const name = roomSlugToNameObj[slug?.trim()];
  if (!name) throw new Error(`Unknown room: ${slug}`);
  return name;
};

const roomNameToSlug = (name) => {
  const slug = Object.entries(roomSlugToNameObj).find(
    ([_, n]) => n === name?.trim()
  );
  if (!slug) throw new Error(`Unknown room: ${name}`);
  return slug[0];
};

const getUKTime = (rawDate, hour, minute) => {
  const [year, month, day, _] = rawDate.split(/[^0-9]+/);

  const zonedDateTime = Temporal.ZonedDateTime.from({
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    hour: parseInt(hour),
    minute: parseInt(minute),
    timeZone: "Europe/London",
  });

  return zonedDateTime.toInstant().toString();
};

const getValidCurrency = (prices) => {
  if (!prices.length) return "GBP";

  const nonZeroPrices = prices.filter((p) => p.amount !== 0);
  const currency = nonZeroPrices[0]
    ? nonZeroPrices[0].currency
    : prices[0].currency;

  const invalidCurrencies = nonZeroPrices.filter(
    (p) => p.currency !== currency
  );
  if (invalidCurrencies.length > 0)
    throw new Error("Cannot add prices with different currencies");

  return currency;
};

const addPrices = (...price) => {
  const currency = getValidCurrency(price);
  const amount = price.reduce((total, p) => total + p.amount, 0);

  return { currency, amount };
};

const multiplyPrice = (price, multiplier) => {
  return { currency: price.currency, amount: price.amount * multiplier };
};

const formatPrice = (price) => {
  const symbol = { GBP: "£" }[price?.currency];

  if (!symbol || !price?.amount) throw new Error("Invalid price object");

  const rawAmount = (price.amount / 100).toFixed(2);
  const [rawMajor, rawMinor] = rawAmount.split(".");
  const major = parseInt(rawMajor).toLocaleString();
  const minor = rawMinor === "00" ? "" : `.${rawMinor}`;
  return `${symbol}${major}${minor}`;
};

const getPriceToPay = async ({ dateRange, numberOfGuests, room }) => {
  const url = `${process.env.URL}/netlify/room-rates.json`;
  console.log(`Making a request to ${url}`);
  const roomRates = await (await fetch(url)).json();

  // If someone is in a room for Saturday, Sunday, then that's only 1 night, Saturday night
  // If someone is in a room for Monday, Tuesday, Wednesday, then that's 2 nights, Monday and Tuesday nights
  // The dateRange.end should be 10:00 on the day of checkout, and the dateRange.start should be 15:00 on the day of checkin
  // This means that a stay of 1 night would have 19 hours between it
  const totalNights = Math.ceil(
    dateFns.differenceInHours(dateRange.end, dateRange.start) / 24
  );
  // Saturdays are priced differently, so we need to count how many Saturdays are in the date range
  const totalSaturdays = dateFns
    .eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end,
    })
    .filter((date) => dateFns.isSaturday(date)).length;
  // August is also priced differently, so we need to count how many days in August are in the date range
  const totalAugustDays = dateFns
    .eachDayOfInterval({
      start: dateRange.start,
      end: dateRange.end,
    })
    .filter((date) => dateFns.getMonth(date) === 7).length;

  const totalNonSaturdays = totalNights - totalSaturdays;

  const saturdayPrice = multiplyPrice(roomRates[room].saturday, totalSaturdays);
  const nonSaturdayPrice = multiplyPrice(
    roomRates[room].standard,
    totalNonSaturdays
  );
  const augustAdditions = multiplyPrice(AUGUST_EXTRA, totalAugustDays);
  const validDiscounts =
    numberOfGuests === 1
      ? [
          {
            description: "Single occupancy discount",
            percent: SINGLE_OCCUPANCY_DISCOUNT,
          },
        ]
      : [];

  const lineItems = [
    {
      description: `Saturday night x ${totalSaturdays}`,
      price: saturdayPrice,
    },
    {
      description: `Non-Saturday night x ${totalNonSaturdays}`,
      price: nonSaturdayPrice,
    },
    {
      description: `August nights x ${totalAugustDays}`,
      price: augustAdditions,
    },
    ...validDiscounts.filter((d) => d.amount < 0),
  ].filter((d) => d.price.amount !== 0);

  const preDiscountTotal = addPrices(...lineItems.map((li) => li.price));
  const percentageDiscountLineItems = validDiscounts
    .filter((d) => d.percent > 0)
    .map((d) => ({
      description: d.description,
      price: multiplyPrice(preDiscountTotal, -d.percent),
    }));

  lineItems.push(...percentageDiscountLineItems);

  const price = addPrices(...lineItems.map((li) => li.price));

  return { price, lineItems };
};

module.exports = {
  roomToCalendarId,
  roomSlugToName,
  roomNameToSlug,
  getUKTime,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
  ROOM_TO_CALENDAR_ID,
  addPrices,
  multiplyPrice,
  formatPrice,
  getPriceToPay,
};

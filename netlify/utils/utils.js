const { Temporal } = require("@js-temporal/polyfill");
const dateFns = require("date-fns");

const CHECK_IN_HOUR = 15;
const CHECK_OUT_HOUR = 10;
const SINGLE_OCCUPANCY_DISCOUNT = { percentage: 10 };

const roomToCalendarId = (room) => {
  switch (room) {
    case "elzevir_block":
      return "a864c89beb4df2734cb5fefab8e53bd6582e909efd3d37abbe5191b5b5518c71@group.calendar.google.com";

    case "y_not":
      return "a9b45dd28c168253fb7d137cba71f049592f6e6769c401393ac72bd175f08295@group.calendar.google.com";

    case "master_ratsey":
      return "7fa250fb572b58629ff523ea600508bb87ec936aedd94bc774e2c729f17813bd@group.calendar.google.com";

    case "josephs_pit":
      return "9b4699ab46c5c9781f0be00b7c8b38e950c90563fc068b539f31ffb0a8a2b8f0@group.calendar.google.com";

    case "the_mohune":
      return "87143580ff32a8338f6c3686825a92976a6e7e1ebe20057c697634f34b8885a8@group.calendar.google.com";

    case "jeremy_fox":
      return "95605ca8ae682fb66c60c0d8c00fe4946dd85eb167fc9724a8218d8aba659464@group.calendar.google.com";

    default:
      throw new Error(`Unknown room: ${room}`);
  }
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

  const amount = (price.amount / 100).toFixed(2);
  return `${symbol}${amount}`;
};

const applyDiscount = (price, discount) => {
  const newPrice = { ...price };
  if (discount.percentage) {
    newPrice.amount -= price.amount * (discount.percentage / 100);
  } else if (discount.amount) {
    newPrice.amount -= discount.amount;
  }

  return newPrice;
};
const applyDiscounts = (price, discounts) => {
  return discounts.reduce(applyDiscount, price);
};

const getPriceToPay = async ({ dateRange, numberOfGuests, room }) => {
  // make a network request to the host URL's /netlify/room-rates.json and parse the JSON response
  const roomRates = await (
    await fetch(`${process.env.DEPLOY_URL}/netlify/room-rates.json`)
  ).json();

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

  const totalNonSaturdays = totalNights - totalSaturdays;

  const saturdayPrice = multiplyPrice(roomRates[room].saturday, totalSaturdays);
  const nonSaturdayPrice = multiplyPrice(
    roomRates[room].standard,
    totalNonSaturdays
  );
  const validDiscounts =
    numberOfGuests === 1 ? [SINGLE_OCCUPANCY_DISCOUNT] : [];
  const price = applyDiscounts(
    addPrices(saturdayPrice, nonSaturdayPrice),
    validDiscounts
  );

  return price;
};

module.exports = {
  roomToCalendarId,
  getUKTime,
  CHECK_IN_HOUR,
  CHECK_OUT_HOUR,
  addPrices,
  multiplyPrice,
  formatPrice,
  applyDiscounts,
  getPriceToPay,
};

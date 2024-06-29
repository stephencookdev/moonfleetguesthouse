const { getPriceToPay } = require("../utils/utils");

exports.handler = async (event) => {
  try {
    const { dateRange, numberOfGuests, room } = JSON.parse(event.body);

    const price = await getPriceToPay({ dateRange, numberOfGuests, room });

    return {
      statusCode: 200,
      body: JSON.stringify({ price }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

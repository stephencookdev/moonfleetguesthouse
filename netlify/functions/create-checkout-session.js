const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sgMail = require("@sendgrid/mail");
const omit = require("lodash.omit");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  try {
    const { customerInfo } = JSON.parse(event.body);

    // Create a customer if not already created
    const customer = await stripe.customers.create({
      email: customerInfo.email,
      name: customerInfo.name,
      phone: customerInfo.phone,
      metadata: omit(customerInfo, ["email", "name", "phone"]),
    });

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });

    if (customer && setupIntent) {
      await sgMail.send({
        to: customerInfo.email,
        from: "stephen.richard.cook@gmail.com",
        templateId: "d-3ad8a8279360488d84d58d1f351df412",
        dynamicTemplateData: {
          date: customerInfo.checkInDate,
        },
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

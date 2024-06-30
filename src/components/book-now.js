import React, { useState } from "react";
import Modal from "react-modal";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import useAvailability from "../hooks/use-availability";

const CHECK_IN_HOUR = 15;
const CHECK_OUT_HOUR = 10;

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY);

const formatPrice = (price) => {
  const symbol = { GBP: "£" }[price?.currency];

  if (!symbol || !price?.amount) throw new Error("Invalid price object");

  const amount = (price.amount / 100).toFixed(2);
  return `${symbol}${amount}`;
};

// Custom date formatting function
const formatDate = (date, dateShape) => {
  if (dateShape !== "YYYY-MM-DD") throw new Error("Unsupported date shape");
  return date.toISOString().split("T")[0];
};

const getDateAtHour = (date, hour) => {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  return newDate;
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email format").required("Required"),
  phone: Yup.string().required("Required"),
  numberOfGuests: Yup.number().required("Required").min(0).max(5),
  postalCode: Yup.string().required("Required"),
});

const BookNowInner = ({ room, ...props }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [[startDate, endDate], setDateRange] = useState([null, null]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [focusedInput, setFocusedInput] = useState(null);

  const { busyDates, price } = useAvailability({
    dateRange: { start: startDate, end: endDate },
    room,
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    numberOfGuests,
    postalCode: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!stripe || !elements) {
      setSubmitting(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerInfo: {
          ...values,
          checkInDate: formatDate(startDate, "YYYY-MM-DD"),
          checkOutDate: formatDate(endDate, "YYYY-MM-DD"),
        },
        room,
      }),
    });

    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: values.name,
          email: values.email,
          phone: values.phone,
          address: {
            postal_code: values.postalCode,
          },
        },
      },
    });

    if (error) {
      console.error("Error confirming card setup:", error);
    } else {
      alert(
        "Payment Method Saved. Your payment method has been saved for future use."
      );
    }

    setSubmitting(false);
    setModalIsOpen(false);
  };

  const handleDatesChange =
    (setErrors) =>
    ([rawStartDate, rawEndDate]) => {
      const startDate = getDateAtHour(rawStartDate, CHECK_IN_HOUR);
      const endDate = getDateAtHour(rawEndDate, CHECK_OUT_HOUR);

      if (startDate && endDate) {
        const isRangeBlocked = busyDates.some(
          (busyDate) =>
            (startDate >= busyDate.start && startDate <= busyDate.end) || // Start date is within a busy date
            (endDate >= busyDate.start && endDate <= busyDate.end) || // End date is within a busy date
            (startDate <= busyDate.start && endDate >= busyDate.end) // Busy date is within the selected range
        );

        if (isRangeBlocked) {
          // If the range is blocked, do not update the state
          setErrors({
            endDate: "Cannot pick a date range that includes unavailable dates",
          });
          return;
        }
      }

      setDateRange([startDate, endDate]);
      setFocusedInput(null);
    };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        iconColor: "#666EE8",
        color: "#31325F",
        fontWeight: "300",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: "18px",
        "::placeholder": {
          color: "#CFD7E0",
        },
      },
    },
    hidePostalCode: true,
  };

  const isDateBlocked = (date) => {
    const dateWithTime =
      focusedInput === "startDate"
        ? getDateAtHour(date, CHECK_IN_HOUR)
        : getDateAtHour(date, CHECK_OUT_HOUR);

    return busyDates.some((busyDate) => {
      const busyStart = new Date(busyDate.start);
      const busyEnd = new Date(busyDate.end);
      return dateWithTime >= busyStart && dateWithTime <= busyEnd;
    });
  };

  return (
    <>
      <a href="#" onClick={openModal} {...props} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Checkout Form"
      >
        <h2>Checkout Form</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, setErrors }) => (
            <Form id="checkout-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name</label>
                <Field type="text" id="name" name="name" />
                <ErrorMessage name="name" component="div" />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <Field type="email" id="email" name="email" />
                <ErrorMessage name="email" component="div" />
              </div>
              <div>
                <label htmlFor="phone">Phone</label>
                <Field type="text" id="phone" name="phone" />
                <ErrorMessage name="phone" component="div" />
              </div>
              <div>
                <label htmlFor="numberOfGuests">Number of Guests</label>
                <Field
                  type="number"
                  id="numberOfGuests"
                  name="numberOfGuests"
                  onChange={(e) => {
                    setFieldValue("numberOfGuests", e.target.value);
                    setNumberOfGuests(e.target.value);
                  }}
                />
                <ErrorMessage name="numberOfGuests" component="div" />
              </div>
              <div>
                <label>Dates</label>
                <Field
                  type="date"
                  name="startDate"
                  onChange={handleDatesChange(setErrors)}
                  isBlocked={isDateBlocked}
                />
                <Field
                  type="date"
                  name="endDate"
                  onChange={handleDatesChange(setErrors)}
                  isBlocked={isDateBlocked}
                />
                <ErrorMessage name="endDate" component="div" />
              </div>
              <div>
                <label htmlFor="postalCode">Postal Code</label>
                <Field type="text" id="postalCode" name="postalCode" />
                <ErrorMessage name="postalCode" component="div" />
              </div>
              <div>
                <label htmlFor="cardElement">Card Details</label>
                <CardElement id="cardElement" options={cardElementOptions} />
              </div>
              <div>
                <p>Price: {price ? formatPrice(price) : "Calculating..."}</p>
                <p>(you will not be charged until 10 days before your stay)</p>
              </div>
              <button type="submit">Submit</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

const BookNow = (props) => (
  <Elements stripe={stripePromise}>
    <BookNowInner {...props} />
  </Elements>
);

export default BookNow;

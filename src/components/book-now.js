import React, { useRef, useState, useEffect } from "react";
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
import { addDays, format, setHours, setMinutes, startOfDay } from "date-fns";
import useAvailability from "../hooks/use-availability";
import usePrice from "../hooks/use-price";
import DatePicker from "./date-picker";
import * as styles from "./book-now.module.css";

const CHECK_IN_HOUR = 15;
const CHECK_OUT_HOUR = 10;

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY);

const formatPrice = (price) => {
  const symbol = { GBP: "£" }[price?.currency];

  if (!symbol || !price?.amount) throw new Error("Invalid price object");

  const rawAmount = (price.amount / 100).toFixed(2);
  const [rawMajor, rawMinor] = rawAmount.split(".");
  const major = parseInt(rawMajor).toLocaleString();
  const minor = rawMinor === "00" ? "" : `.${rawMinor}`;
  return `${symbol}${major}${minor}`;
};

const getDateAtHour = (date, hour) => {
  return setHours(setMinutes(date, 0), hour);
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email format").required("Required"),
  phone: Yup.string().required("Required"),
  numberOfGuests: Yup.number().required("Required").min(1).max(5),
  postalCode: Yup.string().required("Required"),
});

const BookNowInner = ({ room: roomName, dateRange, ...props }) => {
  const stripe = useStripe();
  const elements = useElements();
  const resetFormRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [[startDate, endDate], setDateRange] = useState([
    dateRange?.start || null,
    dateRange?.end || null,
  ]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [success, setSuccess] = useState(null);
  const [cardError, setCardError] = useState(null);
  const maxDate = startOfDay(addDays(new Date(), 365));
  const room = roomName
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  const { roomToBusyDates, isLoading: isBusyDatesLoading } = useAvailability({
    maxDate,
    rooms: room ? [room] : [],
  });
  const busyDates = roomToBusyDates[room] || [];
  const {
    price,
    lineItems,
    isLoading: isPriceLoading,
  } = usePrice({
    dateRange: { start: startDate, end: endDate },
    numberOfGuests,
    room,
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    numberOfGuests,
    postalCode: "",
    notes: "",
  };

  useEffect(() => {
    resetFormRef.current?.();
    setDateRange([dateRange?.start || null, dateRange?.end || null]);
    setNumberOfGuests(2);
  }, [modalIsOpen]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!stripe || !elements) {
      setSubmitting(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const response = await fetch(
      "/.netlify/functions/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerInfo: {
            ...values,
            checkInDate: format(startDate, "yyyy-MM-dd"),
            checkOutDate: format(endDate, "yyyy-MM-dd"),
          },
          room,
        }),
      }
    );

    const { clientSecret, customerId } = await response.json();

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
      setCardError("Something went wrong confirming your card");
      console.error("Error confirming card setup:", error);
    } else {
      setSuccess(customerId || "Unknown");
    }

    setSubmitting(false);
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
        iconColor: "#222",
        color: "#222",
        fontWeight: "300",
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontWeight: 300,
        "::placeholder": {
          color: "#bbb",
        },
      },
    },
    hidePostalCode: true,
  };

  return (
    <>
      <a href="#" onClick={openModal} {...props} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Checkout Form"
      >
        <div className={styles.modal}>
          <h2 className={styles.title}>Checkout for {roomName}</h2>

          {success ? (
            <div className={styles.success}>
              <p>Success! Your booking ID is {success}.</p>
              <p>We look forward to seeing you soon.</p>

              <button
                type="button"
                onClick={closeModal}
                className={styles.secondaryCta}
              >
                Cancel
              </button>
            </div>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                handleSubmit,
                setFieldValue,
                setErrors,
                isSubmitting,
                resetForm,
              }) => (
                <Form
                  id="checkout-form"
                  onSubmit={handleSubmit}
                  className={styles.form}
                  useRef={() => {
                    resetFormRef.current = resetForm;
                  }}
                >
                  <div>
                    <label htmlFor="name" className={styles.label}>
                      Name
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={styles.label}>
                      Email
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={styles.label}>
                      Phone
                    </label>
                    <Field
                      type="text"
                      id="phone"
                      name="phone"
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="numberOfGuests" className={styles.label}>
                      Number of Guests
                    </label>
                    <Field
                      type="number"
                      id="numberOfGuests"
                      name="numberOfGuests"
                      onChange={(e) => {
                        setFieldValue(
                          "numberOfGuests",
                          parseInt(e.target.value)
                        );
                        setNumberOfGuests(parseInt(e.target.value));
                      }}
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="numberOfGuests"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Dates</label>
                    <DatePicker
                      maxDate={maxDate}
                      dateRange={{ start: startDate, end: endDate }}
                      onChange={handleDatesChange(setErrors)}
                      disabledDateRanges={busyDates}
                      disabled={isBusyDatesLoading}
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="endDate"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className={styles.label}>
                      Billing House Name / Number
                    </label>
                    <Field
                      type="text"
                      id="houseName"
                      name="houseName"
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="houseName"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className={styles.label}>
                      Billing Postal Code
                    </label>
                    <Field
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      className={styles.input}
                    />
                    <ErrorMessage
                      name="postalCode"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div>
                    <label htmlFor="cardElement" className={styles.label}>
                      Card Details
                    </label>
                    <CardElement
                      id="cardElement"
                      options={cardElementOptions}
                      className={styles.cardElement}
                    />
                    {!!cardError && (
                      <div className={styles.error}>{cardError}</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="notes" className={styles.label}>
                      Requests / Notes
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      className={styles.input}
                    />
                  </div>
                  {(!!price || isPriceLoading) && (
                    <div className={styles.pricing}>
                      <ul>
                        {lineItems.map((lineItem, index) => (
                          <li key={index}>
                            {lineItem.description}:{" "}
                            {formatPrice(lineItem.price)}
                          </li>
                        ))}
                      </ul>
                      <p>
                        Total:{" "}
                        {isPriceLoading ? "Calculating..." : formatPrice(price)}
                      </p>
                      <p>
                        You will not be charged today. You will be charged 7
                        days before your check-in date, for the price of the
                        first night, at which point the amount is non-refundable
                        in the case of a cancellation or no-show.
                      </p>
                    </div>
                  )}
                  <div className={styles.actions}>
                    <button
                      type="submit"
                      className={styles.cta}
                      disabled={isSubmitting}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className={styles.secondaryCta}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
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

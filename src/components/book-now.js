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

const stripePromise = loadStripe(process.env.GATSBY_STRIPE_PUBLIC_KEY);

const BookNowInner = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email format").required("Required"),
    phone: Yup.string().required("Required"),
    checkInDate: Yup.date().required("Required"),
    checkOutDate: Yup.date().required("Required"),
  });

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
      body: JSON.stringify({ customerInfo: values }),
    });

    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: values.name,
          email: values.email,
          phone: values.phone,
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

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
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
          {({ handleSubmit }) => (
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
                <label htmlFor="checkInDate">Check-in Date</label>
                <Field type="date" id="checkInDate" name="checkInDate" />
                <ErrorMessage name="checkInDate" component="div" />
              </div>
              <div>
                <label htmlFor="checkOutDate">Check-out Date</label>
                <Field type="date" id="checkOutDate" name="checkOutDate" />
                <ErrorMessage name="checkOutDate" component="div" />
              </div>
              <div>
                <label htmlFor="cardElement">Card Details</label>
                <CardElement id="cardElement" />
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

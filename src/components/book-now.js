import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

export const useBookHref = (telephone, email) => {
  const [useTelephone, setUseTelephone] = useState(true);
  useEffect(() => {
    if (window.innerWidth > 800) {
      setUseTelephone(false);
    }
  }, []);

  return useTelephone ? `tel:${telephone}` : `mailto:${email}`;
};

const BookNow = ({ telephone, email, ...props }) => {
  const bookHref = useBookHref(telephone, email);
  return <a href={bookHref} {...props} />;
};

BookNow.propTypes = {
  telephone: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};

export default BookNow;

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

const BookNow = ({ telephone, email, children, ...props }) => {
  const bookHref = useBookHref(telephone, email);
  return (
    <a href={bookHref} {...props}>
      {children}
    </a>
  );
};

BookNow.propTypes = {
  telephone: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BookNow;

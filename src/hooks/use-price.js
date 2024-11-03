import { useState, useEffect } from "react";

const usePrice = ({ dateRange, room, numberOfGuests }) => {
  const [price, setPrice] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!room) return;

    if (dateRange?.start && dateRange?.end) {
      const fetchPrice = async () => {
        setIsLoading(true);

        const priceResponse = await fetch("/.netlify/functions/get-price", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRange,
            numberOfGuests,
            room,
          }),
        });

        const { price, lineItems } = await priceResponse.json();
        setPrice(price || null);
        setLineItems(lineItems || []);

        setIsLoading(false);
      };

      fetchPrice();
    }
  }, [dateRange?.start, dateRange?.end, numberOfGuests, room]);

  return { price, lineItems, isLoading };
};

export default usePrice;

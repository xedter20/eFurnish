export const formatPrice = (price = 0) => {
  const result = Number.isInteger(price) ? price : price.toFixed(2);
  return result.toLocaleString("en-US", {
    style: "currency",
    currency: "PHP",
  });
};

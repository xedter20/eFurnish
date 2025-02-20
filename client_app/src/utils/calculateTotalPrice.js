export const calculateTotalPrice = (items, cityShipp) => {
  const shippingFee = cityShipp || 120;
  const totalPrice = items.reduce((acc, curr) => {
    return acc + curr.quantity * curr.price;
  }, 0);
  return totalPrice + shippingFee;
};

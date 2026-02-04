export const recalculateCart = (cart) => {
  cart.subTotal = cart.items.reduce(
    (sum, item) => sum + item.total,
    0
  );
};

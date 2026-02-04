import Cart from "../../models/cart.model.js";
import Food from "../../models/food.model.js";
import { recalculateCart } from "../../utils/cart.js";

const cartPopulate = [
  {
    path: "restaurant",
    select: "name isOpen isActive isApproved deliveryTime deliveryCharge"
  },
  {
    path: "items.food",
    select: "name image price"
  }
];


export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { foodId, quantity = 1 } = req.body;

    // 1️⃣ Validate food
    const food = await Food.findById(foodId).populate("restaurant");
    if (!food || !food.isAvailable) {
      return res.status(400).json({ message: "Food not available" });
    }

    // 2️⃣ Validate restaurant
    const restaurant = food.restaurant;
    if (!restaurant.isApproved || !restaurant.isOpen || !restaurant.isActive) {
      return res.status(400).json({ message: "Restaurant not accepting orders" });
    }

    // 3️⃣ Get cart
    let cart = await Cart.findOne({ user: userId });

    // 4️⃣ No cart → create
    if (!cart) {
      cart = await Cart.create({
        user: userId,
        restaurant: restaurant._id,
        items: [],
        subTotal: 0
      });
    }

    // 5️⃣ Different restaurant check
    if (cart.restaurant && cart.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(400).json({
        message: "Cart contains items from another restaurant"
      });
    }

    // 6️⃣ Check existing item
    const itemIndex = cart.items.findIndex(
      item => item.food.toString() === foodId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].total = cart.items[itemIndex].quantity * food.price;
    } else {
      cart.items.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity,
        total: food.price * quantity
      });
    }

    // 7️⃣ Recalculate subtotal
    cart.subTotal = cart.items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    cart.restaurant = restaurant._id;
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(cartPopulate);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: populatedCart
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const userId = req.user._id;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      i => i.food.toString() === foodId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    item.total = quantity * item.price;

    recalculateCart(cart);
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(cartPopulate);

    res.json({
      success: true,
      cart: populatedCart
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.json({ items: [] });

  cart.items = cart.items.filter(
    item => item.food.toString() !== req.params.foodId
  );

  recalculateCart(cart);

  if (cart.items.length === 0) {
    cart.restaurant = null;
  }

  await cart.save();
  const populatedCart = await Cart.findById(cart._id).populate(cartPopulate);
  res.json({
    success: true,
    cart: populatedCart
  });
};

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(cartPopulate);

  res.json(cart || { items: [] });
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], subTotal: 0, restaurant: null }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const updateQuantity = async (req, res) => {
//   const { quantity } = req.body;

//   if (quantity < 1) {
//     return res.status(400).json({ message: "Invalid quantity" });
//   }

//   const cart = await Cart.findOne({ user: req.user._id });

//   const item = cart.items.find(
//     i => i.food.toString() === req.params.foodId
//   );

//   if (!item) return res.status(404).json({ message: "Item not found" });

//   item.quantity = quantity;
//   item.total = quantity * item.price;

//   cart.subTotal = cart.items.reduce((s, i) => s + i.total, 0);

//   await cart.save();
//   res.json(cart);
// };

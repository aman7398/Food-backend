import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import Address from "../../models/Address.models.js";
import transporter from "../../config/mailer.js";
import User from "../../models/User.models.js";

export const placeOrder = async (userId, addressId, paymentMethod) => {
  const cart = await Cart.findOne({ user: userId })
    .populate("items.food")
    .populate({
      path: "restaurant",
      populate: {
        path: "owner",
        select: "email name",
      },
    });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) {
    throw new Error("Invalid address");
  }

  let orderItems = [];
  let totalAmount = 0;
  let ordered = [];

  for (const item of cart.items) {
    const food = item.food;
    const itemTotal = food.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity: item.quantity,
      total: itemTotal,
    });
    ordered.push({
      name: food.name,
      quantity: item.quantity,
    })
  }

  const deliveryCharge = totalAmount > 500 ? 0 : 50;
  const grandTotal = totalAmount + deliveryCharge;

  const order = await Order.create({
    userId,
    restaurant: cart.restaurant._id,
    orderItems,
    address: {
      fullAddress: address.fullAddress,
      pincode: address.pincode,
      lat: address.lat,
      lng: address.lng,
    },
    payment: { method: paymentMethod || "COD" },
    totalAmount,
    deliveryCharge,
    grandTotal,
  });

  // Clear cart
  cart.items = [];
  await cart.save();

  /* ================= EMAIL SECTION ================= */
  const user = await User.findById(userId)
  console.log("user", user)
  const restaurantEmail = cart.restaurant?.owner?.email;
  const restaurantName = cart.restaurant?.name;
  const orderedItemsHTML = ordered
    .map(item => `<li>${item.name} × ${item.quantity}</li>`)
    .join("");

  const UserHTML = `
    <h2>You Order is placed 🍔</h2>
    <p><b>Restaurant:</b> ${restaurantName}</p>
    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Total Amount:</b> ₹${grandTotal}</p>
    <p>Please check admin panel for full order details.</p>
  `;
  const RestaurantHTML = `
    <h2>New Order Received 🍔</h2>
    <p><b>Restaurant:</b> ${restaurantName}</p>
    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Order Items:</b>
      <ul>
        ${orderedItemsHTML}
      </ul>
    </p>
    <p><b>Order By:</b> ${user.name}</p>
    <p><b>Total Amount:</b> ₹${grandTotal}</p>
    <p>Please check admin panel for full order details.</p>
  `;
  const AdminHTML = `
    <h2>New Order Received 🍔</h2>
    <p><b>Restaurant:</b> ${restaurantName}</p>
    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Order By:</b> ${user.name}</p>
    <p><b>Phone number:</b> ${user.mobile}</p>
    <p><b>Order Address:</b>
       ${address.name}
       ${address.addressLine}
       ${address.city}
       ${address.state}
       ${address.pincode}
    </p>
    <p><b>Total Amount:</b> ₹${grandTotal}</p>
    <p>Please check admin panel for full order details.</p>
  `;

  try {
    // console.log({
    //   smtpEmail: process.env.ADMIN_EMAIL,
    //   smtpPass: process.env.ADMIN_EMAIL_PASSWORD ? "OK" : "MISSING",
    //   adminEmail: process.env.ADMIN_EMAIL,
    // });

    await transporter.verify();
    console.log("SMTP ready 🚀");

    // 📩 Email to Restaurant
    if (restaurantEmail) {
      await transporter.sendMail({
        to: restaurantEmail,
        subject: "New Order Received",
        html: RestaurantHTML,
      });
    }

    // 📩 Email to Admin
    await transporter.sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Order Placed",
      html: AdminHTML,
    });

    if (user.email) {
      await transporter.sendMail({
        to: user.email,
        subject: "New Order Placed",
        html: UserHTML,
      });
    }

  } catch (error) {
    console.error("Email sending failed:", error.message);
    // ❗ Do NOT throw error – order already placed
  }

  return order;
};

export const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) throw new Error("Order not found");
  if (order.orderStatus !== "PLACED") {
    throw new Error("Order cannot be cancelled now");
  }

  order.orderStatus = "CANCELLED";
  await order.save();

  return order;
};

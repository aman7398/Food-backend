import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  foodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  name: String,          // snapshot
  price: Number,         // snapshot
  quantity: Number,
  total: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    orderItems: [orderItemSchema],

    address: {
      fullAddress: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    payment: {
      method: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD",
      },
      status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
      transactionId: String,
    },

    orderStatus: {
      type: String,
      enum: ["PLACED", "PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
      default: "PLACED",
      index: true,
    },

    totalAmount: Number,
    deliveryCharge: Number,
    grandTotal: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
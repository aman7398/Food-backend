import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true
  },
  name: String,          // snapshot
  price: Number,         // snapshot
  quantity: {
    type: Number,
    min: 1
  },
  total: Number
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
    },

    items: [cartItemSchema],

    subTotal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
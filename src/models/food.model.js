import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    name: String,
    price: Number,
    category: String,
    image: [String],
    description: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);

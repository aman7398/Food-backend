import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    description: String,
    image: [String],

    address: {
      fullAddress: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number
    },

    deliveryTime: Number,
    deliveryCharge: Number,

    isOpen: {
      type: Boolean,
      default: true
    },

    openTime: String,   // "10:00"
    closeTime: String,  // "23:00"

    isApproved: {
      type: Boolean,
      default: false   // SUPER_ADMIN approval
    },

    isActive: {
      type: Boolean,
      default: true   // soft delete / block
    }
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);

restaurantSchema.virtual("foods", {
  ref: "Food",
  localField: "_id",
  foreignField: "restaurant",
});

restaurantSchema.set("toJSON", { virtuals: true });
restaurantSchema.set("toObject", { virtuals: true });
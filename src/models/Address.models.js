import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        enum: ["HOME", "WORK", "OTHER"],
        default: "HOME"
    },
    addressLine: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    lat: Number,
    lng: Number,
    isDefault: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
);

export default mongoose.model("Address", addressSchema);

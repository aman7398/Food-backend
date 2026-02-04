import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        mobile: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: String,
            enum: ["user", "admin", "restaurant_admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true
        },
        deletedAt: {
            type: Date,
            default: null
        },
        otp: {
            type: String,
        },
        otpExpire: {
            type: Date,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpire: {
            type: Date,
        },
    },
    { timestamps: true }
);
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = randomBytes(32).toString("hex");

    this.resetPasswordToken = createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.otp = createHash("sha256").update(otp).digest("hex");
    this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
}


const User = mongoose.model("User", userSchema);
export default User;

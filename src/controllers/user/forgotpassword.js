import User from "../../models/User.models.js";
// import generateToken from "../utils/generateToken.js";
import sendEmail from "../../utils/sendEmail.js";

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password</p>
            <p>Click below to reset:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 10 minutes</p>
            `;

        await sendEmail({
            email: user.email,
            subject: "Password Reset - Food App",
            message,
        });

        res.status(200).json({
            message: "Password reset email sent successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email could not be sent" });
    }
};


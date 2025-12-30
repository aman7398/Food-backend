import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";
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

        // In a real application, you would send the resetUrl via email to the user.
        console.log("RESET LINK", resetUrl);

        res.status(200).json({
            message: "Password reset link sent to email",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

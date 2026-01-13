import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";
import { createHash } from "crypto";

// export const registerUser = async (req, res) => {
//     try {
//         console.log("REQ BODY", req.body);

//         const { name, email, mobile, password } = req.body;
//         if (!name || !email || !mobile || !password) {
//             return res.status(400).json({ message: "All fields required" });
//         }
//         const userExists = await User.findOne({
//             $or: [{ email }, { mobile }],
//         });
//         console.log("USER EXISTS", userExists);

//         if (userExists) {
//             return res.status(400).json({ message: "User already exists" });
//         }
//         const user = await User.create({
//             name,
//             email,
//             mobile,
//             password,
//             role: "user",
//         });
//         console.log("USER CREATED", user);

//         const otp = user.generateOTP();
//         await user.save({ validateBeforeSave: false });

//         console.log("USER SAVED WITH OTP", user, otp);

//         res.status(200).json({
//             message: "OTP sent to your mobile number",
//             userId: user._id,
//         });

//         return res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             mobile: user.mobile,
//             role: user.role,
//             token: generateToken(user._id),
//         });

//     } catch (error) {
//         console.error("REGISTER ERROR FULL");
//         console.error(error);
//         console.error(error.message);
//         res.status(500).json({ message: error.message });
//         console.error(error.stack);

//         return res.status(500).json({
//             message: "Register failed",
//             error: error.message,
//         });
//     }
// };

export const registerUser = async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userExists = await User.findOne({
            $or: [{ email }, { mobile }],
        });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            mobile,
            password,
            role: "user",
        });

        // otp genrate and save
        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        console.log("REGISTER OTP:", otp);

        return res.status(201).json({
            success: true,
            userCreated: true,
            isVerified: false,
            message: "OTP sent to your mobile number. Please verify to continue.",
            userId: user._id,
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({
            message: "Register failed",
            error: error.message,
        });
    }
};

export const loginUser = async (req, res) => {
    try {

        console.log("REQ BODY", req.body);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify OTP first" });
        }

        console.log("USER LOGGED IN", user);

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        })
    } catch (error) {
        console.error("LOGIN ERROR FULL");
        console.error(error);
        console.error(error.message);
        console.error(error.stack);
        return res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
    console.log("LOGIN CONTROLLER REACHED");
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};

export const verifyOPT = async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp) {
            return res.status(400).json({ message: "Mobile and OTP are required" });
        }
        const hashedOtp = createHash("sha256").update(otp).digest("hex");
        const user = await User.findOne({
            mobile,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({ message: "Invalid OTP or OTP expired" });
        }
        user.isverified = true;
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save();
        return res.status(200).json({
            message: "OTP verified successfully",
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({
            message: "OTP verification failed",
            error: error.message,
        });
    }
};

export const resendOTP = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) {
            return res.status(400).json({ message: "Mobile number is required" });
        }
        const user = await User.findOne({ mobile });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.isverified) {
            return res.status(400).json({
                message: "User already verified",
            });
        }

        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });
        console.log("RESEND OTP:", otp);
        return res.status(200).json({
            message: "OTP sent to your mobile number",
        });
    } catch (error) {
        console.error("RESEND OTP ERROR:", error);
        return res.status(500).json({
            message: "Resend OTP failed",
            error: error.message,
        });
    }
};

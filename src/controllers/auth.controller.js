import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";
import { createHash } from "crypto";
import transporter from "../config/mailer.js";
import AddressModels from "../models/Address.models.js";

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
    // console.log("userData", name, email, mobile, password )
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
      isVerified: false,
    });

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await transporter.sendMail({
      to: user.email,
      subject: "OTP Verification - Food App",
      html: `<h3>Your OTP is: ${otp}</h3>`,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Register failed",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  try {

    // console.log("REQ BODY", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    // console.log("user", user)

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

    const address = await AddressModels.findOne({user:user._id,isDefault:true});

    // console.log("USER LOGGED IN", user);

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      address,
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
  // console.log("LOGIN CONTROLLER REACHED");
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const hashedOtp = createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      otp: hashedOtp,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    await transporter.sendMail({
      to: user.email,
      subject: "Resend OTP - Food App",
      html: `<h3>Your OTP is: ${otp}</h3>`,
    });

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Resend OTP failed",
      error: error.message,
    });
  }
};


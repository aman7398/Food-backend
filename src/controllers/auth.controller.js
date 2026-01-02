import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
        console.log("REQ BODY", req.body);

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }
        const userExists = await User.findOne({ email });
        console.log("USER EXISTS", userExists);

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({
            name,
            email,
            password,
            role: "user",
        });
        console.log("USER CREATED", user);

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("REGISTER ERROR FULL");
        console.error(error);
        console.error(error.message);
        console.error(error.stack);

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

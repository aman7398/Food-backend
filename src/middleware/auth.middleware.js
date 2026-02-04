import jwt from 'jsonwebtoken';
import User from '../models/User.models.js';

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("TOKEN", token);
        // console.log("DECODED TOKEN", decoded);
        const user = await User.findById(decoded.id).select("-password");

        // console.log("USER", user);

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token failed" });
    }
};

export default protect;

// const protect = async (req, res, next) => {
//     try {
//         let token;

//         if (
//             req.headers.authorization &&
//             req.headers.authorization.startsWith("Bearer ")
//         ) {
//             token = req.headers.authorization.split(" ")[1];
//         }

//         if (!token) {
//             return res.status(401).json({ message: "No token provided" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         const userId = decoded.id || decoded._id;

//         if (!userId) {
//             return res.status(401).json({ message: "Invalid token payload" });
//         }

//         const user = await User.findById(userId).select("-password -otp");

//         if (!user) {
//             return res.status(401).json({ message: "User not found" });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error("AUTH ERROR 👉", error.message);
//         res.status(401).json({ message: "Token invalid or expired" });
//     }
// };

// export default protect;
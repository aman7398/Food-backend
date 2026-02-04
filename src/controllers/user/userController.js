import User from "../../models/User.models.js";

export const getUserProfile = async (req, res) => {
    const {_id} = req.user;

    try {
        const user = await User.findOne({ _id: _id, isActive: true }).select("-password -otp");
        // console.log("REQ.USER.ID", req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("FETCHED USER", user);

        res.status(200).json({
            success: true,
            data: user,
        });
        // console.log("USER PROFILE", user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const {_id, name, mobile } = req.body;

        const user = await User.User.findOne({ _id, isActive: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.mobile = mobile || user.mobile;
        user.email = user.email;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
        // console.log("UPDATED USER PROFILE", user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAdminProfile = async (req, res) => {
    try {
        const admin = await admin.findById(req.admin._id).select("-password -otp");

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Admin access denied" });
        }
        res.status(200).json({
            success: true,
            data: admin,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

export const updateAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id);

        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ message: "Admin access denied" });
        }

        admin.name = req.body.name || admin.name;

        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin profile updated",
            data: admin,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

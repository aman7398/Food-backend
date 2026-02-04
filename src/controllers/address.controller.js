import Address from "../models/Address.models.js";

export const getUserAddress = async (req, res) => {
    try {
        const { _id } = req.user
        const address = await Address.find({ user: _id }).sort({ isDefault: -1, })
        if (!address) throw new Error("User address not found")

        res.status(200).json({
            message: "Address found",
            data: address,
            success: true,
            error: false
        })
    } catch (error) {
        res.status(404).json({
            message: "Error occurred at finding address",
            success: false,
            error: true
        })
    }
}

export const addAddress = async (req, res) => {
    try {
        const {
            name,
            mobile,
            addressLine,
            city,
            state,
            pincode,
            isDefault,
        } = req.body;

        if (!name || !mobile || !addressLine || !city || !state || !pincode) {
            return res.status(400).json({ message: "All fields are required" });
        }
        // console.log("ADDING ADDRESS FOR USER", req.user._id);
        if (isDefault) {
            await Address.updateMany(
                { user: req.user._id },
                { isDefault: false }
            );
        }

        const address = await Address.create({
            user: req.user._id,
            name,
            mobile,
            addressLine,
            city,
            state,
            pincode,
            isDefault: isDefault || false,
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            data: address,
        });

        // console.log("NEW ADDRESS ADDED", address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, });

        res.status(200).json({
            success: true,
            data: addresses,
        });

        // console.log("FETCHED ADDRESSES", addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // 🔥 If setting this address as default
        if (req.body.isDefault === true) {
            await Address.updateMany(
                {
                    user: req.user._id,
                    _id: { $ne: address._id }, // exclude current address
                },
                { isDefault: false }
            );
        }

        Object.assign(address, req.body);
        await address.save();

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            data: address,
        });

        // console.log("UPDATED ADDRESS", address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
        // console.log("DELETED ADDRESS", address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
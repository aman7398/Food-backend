import Restaurant from "../../models/restaurant.model.js";
import Food from "../../models/food.model.js";

export const getFoodsByPincode = async (req, res) => {
  try {
    const { pincode, page = 1, limit = 20 } = req.query;

    // 1️⃣ Validate pincode
    if (!pincode || typeof pincode !== "string") {
      return res.status(400).json({
        success: false,
        message: "Pincode is required"
      });
    }

    // 2️⃣ Find restaurants by address.pincode
    const restaurants = await Restaurant.find({
      "address.pincode": pincode,
      isApproved: true,
      isOpen: true,
      isActive: true
    })
      .select("_id name rating deliveryTime deliveryCharge address.pincode")
      .lean();

    if (!restaurants.length) {
      return res.status(200).json({
        success: true,
        message: "No restaurants found",
        data: []
      });
    }

    const restaurantIds = restaurants.map(r => r._id);

    // 3️⃣ Fetch foods linked to restaurants
    const foods = await Food.find({
      restaurant: { $in: restaurantIds },
      isAvailable: true
    })
      .populate("restaurant", "name rating deliveryTime deliveryCharge address.pincode")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      restaurantCount: restaurants.length,
      foodCount: foods.length,
      page: Number(page),
      data: foods
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch foods"
    });
  }
};


export const updateFood = async (req, res) => {
  const {id} = req.params
  try {
    const food = await Food.findOne({
      _id: id,
      // restaurant: restaurant._id
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food not found or unauthorized"
      });
    }

    // 3️⃣ Allowed fields for PATCH
    const allowedUpdates = [
      "name",
      "price",
      "category",
      "isAvailable",
      "image",
      "description"
    ];

    // 4️⃣ Apply partial updates safely
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        food[field] = req.body[field];
      }
    });

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food updated successfully",
      food
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update food"
    });
  }
};

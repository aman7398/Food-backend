import Restaurant from "../../models/restaurant.model.js";
import Food from "../../models/food.model.js";
import { Error } from "mongoose";

export const createRestaurant = async (req, res) => {
  try {
    const isExists = await Restaurant.findById(req.user._id)
    if (isExists) throw new Error("You restaurant already exists")

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user._id
    });

    res.status(201).json({
      message: "Restaurant created, awaiting approval",
      restaurant
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  res.json({ message: "Restaurant approved", restaurant });
};

export const getRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find({
    isApproved: true,
    isActive: true,
    isOpen: true
  }).select("name address openTime closeTime");

  res.json(restaurants);
};

export const getEveryRestaurants = async(req, res)=>{
  try {
    const getAll = await Restaurant.find().sort({isApproved:-1, isActive:-1})
    return res.status(200).json({
      data: getAll, 
      success: true,
      error: false,
      message:"All restaurants fetched"
    })
  } catch (error) {
    res.status(500).json({
      message:"Fetch failed",
      success: false,
      error: true
    })
  }
}

export const searchRestaurants = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Search query is required",
      });
    }

    const skip = (page - 1) * limit;

    const data = await Restaurant.aggregate([
      {
        $match: {
          name: { $regex: q.trim(), $options: "i" },
          isActive: true,
          isApproved: true,
          isOpen: true,
        },
      },
      {
        $lookup: {
          from: "foods",
          let: { restaurantId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$restaurant", "$$restaurantId"] },
                    { $eq: ["$isAvailable", true] }
                  ],
                },
              },
            },
          ],
          as: "foods",
        },
      },
      { $skip: Number(skip) },
      { $limit: Number(limit) },
    ]);

    // total count for pagination
    const total = await Restaurant.countDocuments({
      name: { $regex: q.trim(), $options: "i" },
      isActive: true,
      isApproved: true,
      isOpen: true,
    });

    res.status(200).json({
      success: true,
      error: false,
      message: "Search successful",
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Search failed",
    });
  }
};


export const getMyRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne({
    owner: req.user._id
  });

  if (!restaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }

  const myFoods = await Food.find({ restaurant: restaurant._id })

  return res.status(200).json({
    restaurant,
    foods: myFoods,
    success: true,
    error: false,
    message: "Restaurant fetched successfully"
  });
};

export const updateRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true }
  );

  if (!restaurant) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  res.json(restaurant);
};

export const addFood = async (req, res) => {
  try {
    // 1️⃣ Find restaurant owned by this admin
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
      isActive: true,
      isApproved: true
    });

    if (!restaurant) {
      return res.status(403).json({
        message: "No approved restaurant found for this account"
      });
    }

    // 2️⃣ Create food
    const food = await Food.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      image: req.body.image,
      isAvailable: req.body.isAvailable,
      restaurant: restaurant._id
    });

    res.status(201).json({
      success: true,
      food
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const toggleFood = async (req, res) => {
  const food = await Food.findById(req.params.id);
  food.isAvailable = !food.isAvailable;
  await food.save();

  res.json(food);
};

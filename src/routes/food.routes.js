import express from "express";
import auth from "../middleware/auth.middleware.js";
import { getFoodsByPincode, updateFood } from "../controllers/food/foods.controller.js";
import { addFood, toggleFood } from "../controllers/restaurant/restaurant.controller.js";
import restaurantAdminOnly from "../middleware/restaurantAdmin.middleware.js";

const router = express.Router();

router.get("/discover", auth, getFoodsByPincode);
router.post("/add-food", auth, restaurantAdminOnly, addFood);
router.patch("/toogle-food/:id", auth, restaurantAdminOnly, toggleFood)
router.patch("/update-food/:id", auth, restaurantAdminOnly, updateFood)

export default router;
import express from "express";
import auth from "../middleware/auth.middleware.js";
import restaurantAdmin from "../middleware/restaurantAdmin.middleware.js";
import { createRestaurant, approveRestaurant, getRestaurants, getEveryRestaurants, getMyRestaurant, updateRestaurant, addFood, toggleFood, searchRestaurants } from "../controllers/restaurant/restaurant.controller.js"
import isAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/", auth, restaurantAdmin, createRestaurant);
router.patch("/approve/:id", auth, isAdmin, approveRestaurant);
router.patch("/:id", auth, restaurantAdmin, updateRestaurant)

router.get("/", auth, restaurantAdmin, getMyRestaurant)
router.get("/get-all", auth, getRestaurants)
router.get("/get-list", auth, getEveryRestaurants)
router.get("/search", auth, searchRestaurants)

export default router;

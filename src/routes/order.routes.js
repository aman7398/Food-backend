import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  placeOrderController,
  cancelOrderController,
  getMyOrderController,
} from "../controllers/orders/order.controller.js";

const router = express.Router();

router.post("/", auth, placeOrderController);
router.get("/my-orders", auth, getMyOrderController);
router.patch("/:id/cancel", auth, cancelOrderController);

export default router;
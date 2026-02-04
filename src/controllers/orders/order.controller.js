import { Error } from "mongoose";
import { placeOrder, cancelOrder } from "../../services/orders/order.service.js";
import orderModel from "../../models/order.model.js";

export const placeOrderController = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    const order = await placeOrder(
      req.user._id,
      addressId,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyOrderController = async (req, res) => {
  try {
    const id = req.user._id
    if (!id) throw new Error("No id received")

    const myOrders = await orderModel.find({ userId: id }).sort({ createdAt: -1 }).limit(50)

    res.status(200).json({
      message: "My order fetched",
      data: myOrders,
      success: true,
      error: false
    })
  } catch (error) {
    res.status(400).json({
      message: "Order getting failed",
      success: false,
      error: true
    })
  }
}

export const cancelOrderController = async (req, res) => {
  try {
    const order = await cancelOrder(req.user.id, req.params.id);

    res.json({
      success: true,
      message: "Order cancelled",
      order,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

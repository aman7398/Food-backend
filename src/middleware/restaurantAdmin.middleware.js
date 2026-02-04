const restaurantAdminOnly = (req, res, next) => {
  if (req.user.role !== "restaurant_admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

export default restaurantAdminOnly
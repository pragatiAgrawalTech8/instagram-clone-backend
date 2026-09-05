import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Header check karo: "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko request mein attach karo (password chhod ke)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // aage badho
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Token invalid hai, unauthorized" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Token nahi mila, unauthorized" });
  }
};
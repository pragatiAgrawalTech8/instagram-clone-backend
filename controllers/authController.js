import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register new user
// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Sabhi fields zaroori hain" });
    }

    // Check user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username ya email pehle se registered hai" });
    }

    // Password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // User create karo
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || "",
    });

    // Token generate karo
    const token = generateToken(newUser._id);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      profilePic: newUser.profilePic,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password zaroori hai" });
    }

    // User dhundo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Galat email ya password" });
    }

    // Password match karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Galat email ya password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
      bio: user.bio,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
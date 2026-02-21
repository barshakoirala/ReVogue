import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { config } from "../config.js";

const router = Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Registration failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Login failed." });
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted", user: req.user });
});

export default router;

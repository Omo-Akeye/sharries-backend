import passport from "passport";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middlewares/auth.js";

export const isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
};

export const register = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;

  if (!email || !password || !name || !phoneNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (password.length <= 6) {
    return res.status(400).json({ error: "Password must be more than 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error registering user" });
  }
};

// User Login
export const login = (req, res, next) => {
  passport.authenticate("local", { session: false }, async (err, user, info) => {

    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info.message || "Authentication failed" });

/////////////
    const totalSpent = user.calculateTotalSpent();
    user.totalSpent = totalSpent;
    await user.save();
//////////////
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
    
    res.cookie("auth-token", token, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "none",
      partitioned: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    ///
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email
      }
    });
  })(req, res, next);
};



export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)  // Change from req.user.id
      .select('name email phoneNumber totalPurchases orderHistory totalSpent');
    
    res.json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        totalPurchases: user.totalPurchases,
        orderHistory: user.orderHistory,
        totalSpent: user.totalSpent
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Error fetching profile data" });
  }
};

export const userTotalSpent = async (req, res) => {
  try {
  
     const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalSpent = user.calculateTotalSpent();
    user.totalSpent = totalSpent;
    await user.save();

    res.json({
      totalSpent,
      orderDetails: {
        totalOrders: user.orderHistory.length,
        orderID: order.orderID,
        orders: user.orderHistory.map(order => ({
          date: order.orderDate,
          amount: order.totalAmount
        }))
      }
    });
  } catch (error) {
    console.error('Error calculating total spent:', error);
    res.status(500).json({ error: 'Failed to calculate total spent' });
  }
};




export const logout = (req, res) => {

  res.clearCookie("auth-token", {
    path: "/",             
    httpOnly: true,        
    secure: true,           
    sameSite: "none",       
    partitioned: true,     
  });

 
  return res.status(200).json({
    message: "Logged out successfully",
    status: "success",
  });
};



export const checkAuth = [
  authenticateJWT,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .select('name email phoneNumber totalPurchases orderHistory totalSpent');
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      return res.status(200).json({
        status: "success",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          totalPurchases: user.totalPurchases,
          orderHistory: user.orderHistory,
          totalSpent: user.totalSpent
        }
      });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({
        error: "Server error during authentication check",
        status: "error",
      });
    }
  }
];

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
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    
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
    const user = await User.findById(req.user.id)
      .select('name email phoneNumber totalPurchases orderHistory totalSpent');
    
    res.json({
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
    res.status(500).json({ error: "Error fetching profile data" });
  }
};

export const userTotalSpent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
// User Logout
export const logout = (req, res) => {
  res.setHeader(
    "Set-Cookie",
    "auth-token=; HttpOnly; Path=/; Secure; SameSite=Strict; Max-Age=0"
  );

  return res.status(200).json({
    message: "Logged out successfully",
    status: "success",
  });
};

// export const checkAuth = [
  
//   authenticateJWT,
//   (req, res) => {
//     try {
//       const { _id, name, email } = req.user;

//       return res.status(200).json({
//         status: "success",
//         user: { id: _id, name, email },
//       });
//     } catch (error) {
//       console.error("Auth check error:", error);
//       return res.status(500).json({
//         error: "Server error during authentication check",
//         status: "error",
//       });
//     }
//   },
// ];

// export const checkAuth = [
//   authenticateJWT,
//   (req, res) => {
//     try {
//       const { _id, name, email } = req.user;
      
//       // Explicitly set CORS headers for credentials
//       res.header('Access-Control-Allow-Origin', req.headers.origin);
//       res.header('Access-Control-Allow-Credentials', 'true');
      
//       return res.status(200).json({
//         status: "success",
//         user: { id: _id, name, email },
//       });
//     } catch (error) {
//       console.error("Auth check error:", error);
//       return res.status(500).json({
//         error: "Server error during authentication check",
//         status: "error",
//       });
//     }
//   }
// ];
export const checkAuth = [
  authenticateJWT,
  (req, res) => {
    try {
      const { _id, name, email } = req.user;

      return res.status(200).json({
        status: "success",
        user: { id: _id, name, email },
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














// import User from "../models/User.js";
// import bcrypt from 'bcryptjs';
// import passport from "passport";
// export const register = async (req, res) => {
//   const {name,phoneNumber, email, password } = req.body;
//   if (!email || !password  || !name  || !phoneNumber ) {
//     return res.status(400).json({ error: "Incomplete credentials." });
//   }
//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ error: "User already exists." });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({name,phoneNumber, email, password: hashedPassword });
//     await user.save();
//     res.status(201).json({ message: "User registered successfully." });
//   } catch (error) {
//     console.error( error);
//     res.status(500).json({  
//       error: "Error registering user.",
//     });
//   }
// };

// catch (error) {
//   console.error("Error in deleteReview:", error);
//   res.status(500).json({ message: 'Server error' });
// }

// export const login = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required." });
//   }
//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "Account does not exist." });
//     }

//     const isPasswordCorrect = await bcrypt.compare(password, user.password);
//     if (!isPasswordCorrect) {
//       return res.status(401).json({ error: "Incorrect email or password." });
//     }
//     res.status(200).json({ message: "Logged in successfully." });
    
//   } catch (error) {
//     res.status(500).json({ error: "Error logging in." });
//   }
//   }

// export const logOut = async (req, res) => {
//   req.logout(err => {
//     if (err) {
//       return res.status(500).json({ error: "Error logging out." });
//     }
//     res.status(200).json({ message: "Logged out successfully." });
//   });
// };




// const express = require("express");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const User = require("./models/User"); // Replace with your User model
// const app = express();

// app.use(express.json());

// // Configure nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "your_email@gmail.com", // Replace with your email
//     pass: "your_email_password",  // Replace with your email password or app-specific password
//   },
// });

// // Generate a random OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// // Step 1: Request OTP
// app.post("/forgot-password", async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ error: "Email is required." });
//   }

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     const otp = generateOTP();
//     user.resetPasswordToken = otp;
//     user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
//     await user.save();

//     const mailOptions = {
//       to: user.email,
//       from: "your_email@gmail.com",
//       subject: "Password Reset OTP",
//       text: `Your OTP for resetting your password is: ${otp}\n\nThis OTP is valid for 10 minutes.`,
//     };

//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "OTP sent to your email." });
//   } catch (err) {
//     res.status(500).json({ error: "Error sending OTP." });
//   }
// });

// // Step 2: Verify OTP
// app.post("/verify-otp", async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ error: "Email and OTP are required." });
//   }

//   try {
//     const user = await User.findOne({
//       email,
//       resetPasswordToken: otp,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ error: "Invalid or expired OTP." });
//     }

//     // OTP verified, allow password reset
//     res.status(200).json({ message: "OTP verified successfully." });
//   } catch (err) {
//     res.status(500).json({ error: "Error verifying OTP." });
//   }
// });

// // Step 3: Reset Password
// app.post("/reset-password", async (req, res) => {
//   const { email, otp, password } = req.body;

//   if (!email || !otp || !password) {
//     return res.status(400).json({ error: "Email, OTP, and password are required." });
//   }

//   try {
//     const user = await User.findOne({
//       email,
//       resetPasswordToken: otp,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ error: "Invalid or expired OTP." });
//     }

//     // Reset the password
//     user.password = await bcrypt.hash(password, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: "Password reset successfully." });
//   } catch (err) {
//     res.status(500).json({ error: "Error resetting password." });
//   }
// });

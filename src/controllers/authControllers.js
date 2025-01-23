import passport from 'passport';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';


export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

export const register = async (req, res) => {
  const { name, phoneNumber, email, password } = req.body;

  if (!email || !password || !name || !phoneNumber) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      phoneNumber,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
};

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      if (req.session) {
        req.session.cookie.secure = process.env.NODE_ENV === 'production';
        req.session.cookie.sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      }
      return res.json({ 
        message: 'Login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber:user.phoneNumber
        }
      });
    });
  })(req, res, next);
};

export const logout = async (req, res) => {
  try {
   
    if (!req.isAuthenticated()) {
      return res.status(400).json({
        error: 'No active session',
        status: 'error'
      });
    }

    
    await new Promise((resolve, reject) => {
      req.logout((err) => {
        if (err) reject(err);
        resolve();
      });
    });

    
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        resolve();
      });
    });

   
    res.clearCookie('connect.sid', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true
    });

    return res.status(200).json({
      message: 'Logged out successfully',
      status: 'success'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Error during logout process',
      status: 'error'
    });
  }
};




////

export const checkAuth = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        error: 'Not authenticated',
        status: 'error'
      });
    }

    // Refresh session to prevent timeout
    if (req.session) {
      req.session.touch();
    }

    // Extract only necessary user data
    const { _id, name, email } = req.user;
    
    // Return user data without sensitive information
    return res.status(200).json({
      status: 'success',
      user: {
        id: _id,
        name,
        email
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      error: 'Server error during authentication check',
      status: 'error'
    });
  }
};

// Optional: Middleware to refresh session if it's about to expire
export const refreshSession = (req, res, next) => {
  if (req.session && req.session.cookie && req.session.cookie.maxAge) {
    const minutesLeft = req.session.cookie.maxAge / 1000 / 60;
    if (minutesLeft < 5) { // Refresh if less than 5 minutes left
      req.session.touch();
    }
  }
  next();
};















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

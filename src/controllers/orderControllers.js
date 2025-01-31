import crypto from "crypto";
import Order from "../models/Order.js";
import validateCartPrices from "./priceControllers.js"
import User from "../models/User.js";
import passport from 'passport';

  export const optionalAuth = (req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        req.user = null;
        return next();
      }
      req.user = user || null;
      next();
    })(req, res, next);
  };
  
const generateRandomString = (length = 5) => {
  return crypto.randomBytes(length).toString("hex");
};

export const postOrder = async (req, res) => {

  const {
    name,
    email,
    phoneNumber,
    additionalNote,
    shippingFee,
    shippingAddress,
    paymentMethod,
    cartItems
  } = req.body;

  if (!name || !email || !phoneNumber || !shippingFee || !shippingAddress ||
      !paymentMethod || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }
 
  try {
    const orderID = generateRandomString(5);
    const validation = await validateCartPrices(cartItems);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error,
        details: {
          message: validation.error,
          discrepancies: validation.discrepancies,
          expectedTotal: validation.orderSubtotal + shippingFee
        }
      });
    }

    const orderTotal = validation.orderSubtotal + shippingFee;
    const userID = req.user?.id || null;
    if (userID) {
      await User.findByIdAndUpdate(
        userID,
        {
          $push: {
            orderHistory: {
              orderDate: new Date(),
              orderID,
              cartItems: cartItems.map(item => ({
                ...item,
                price: validation.priceMap[item._id],
                subTotal: validation.priceMap[item._id] * item.quantity
              })),
              totalAmount: orderTotal,
              status: 'Pending'
            }
          },
          $inc: { totalPurchases: 1 }
        }
      );
    }

    // const orderID = generateRandomString(5);
   
    
    const newOrder = new Order({
      userID, 
      orderID,
      name,
      email,
      phoneNumber,
      additionalNote: additionalNote || null,
      shippingFee,
      shippingAddress,
      paymentMethod,
      paymentStatus: "checking",
      orderStatus: "processing",
      cartItems: cartItems.map(item => ({
        ...item,
        price: validation.priceMap[item._id],
        subTotal: validation.priceMap[item._id] * item.quantity
      })),
      orderTotal
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      orderID,
      order: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to process order" });
  }
};

export const getOrderByOrderID = async (req, res) => {
    const {orderID} = req.params;
    try {
     
      const order = await Order.findOne({ orderID });
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };


  export const getAllOrders = async (req,res)=>{
    try {
      const orders = await Order.find();
      res.status(200).json(orders)
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

export const deleteOrder = async (req,res)=>{
  const {orderID} = req.params;
  try {
    const order = await Order.findByIdAndDelete(orderID)
    if (!orderID) {
      res.status(404).json({ error: "Order ID does not exist" })
    }
    res.status(200).json({message:"order deleted"})
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const getUserOrderHistory = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orderHistory = {
      totalPurchases: user.totalPurchases,
      orders: user.orderHistory.sort((a, b) => b.orderDate - a.orderDate) 
    };

    res.status(200).json(orderHistory);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};







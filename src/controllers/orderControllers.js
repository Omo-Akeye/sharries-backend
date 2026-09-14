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

const MAX_CART_ITEMS = 50;
const MAX_SHIPPING_FEE = 100000;

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

  if (!name || !email || !phoneNumber || shippingFee === undefined || !shippingAddress ||
      !paymentMethod || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: "All required fields must be provided." });
  }

  if (typeof email !== 'string' || typeof name !== 'string' || typeof shippingAddress !== 'string') {
    return res.status(400).json({ error: "Invalid field types." });
  }

  if (!Number.isFinite(shippingFee) || shippingFee < 0 || shippingFee > MAX_SHIPPING_FEE) {
    return res.status(400).json({ error: "Invalid shipping fee." });
  }

  if (cartItems.length > MAX_CART_ITEMS) {
    return res.status(400).json({ error: `A single order can contain at most ${MAX_CART_ITEMS} items.` });
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
    // const userID = req.user?.id || null;
    const userID = req.user?._id || null; 
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
      console.info(`[AUDIT] ${new Date().toISOString()} user=${req.user._id} viewed all orders`);
      const orders = await Order.find();
      res.status(200).json(orders)
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

export const deleteOrder = async (req,res)=>{
  const {orderID} = req.params;
  try {
    const order = await Order.findOneAndDelete({ orderID });
    if (!order) {
      return res.status(404).json({ error: "Order ID does not exist" });
    }
    console.info(`[AUDIT] ${new Date().toISOString()} user=${req.user._id} deleted order=${orderID}`);
    res.status(200).json({message:"order deleted"})
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

export const getUserOrderHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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







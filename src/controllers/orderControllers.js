import crypto from "crypto";
import Order from "../models/Order.js";

const generateRandomString = (length = 5) => {
  return crypto.randomBytes(length).toString("hex");
};
export const postOrder = async (req, res) => {
    const { name,email,phoneNumber,additionalNote,shippingFee,shippingAddress,paymentMethod,cartItems}  = req.body;
         // Validate required fields
    if ( !name || !email ||!phoneNumber ||!shippingFee ||!shippingAddress ||!paymentMethod || !cartItems ||!Array.isArray(cartItems) ||cartItems.length === 0
      ) {
        return res.status(400).json({ error: "All fields except userID are required." });
      }
  try {
    let userID = null;
    if (req.isAuthenticated && req.isAuthenticated()) {
      userID = req.user?.id || null;
    }
    const orderID = generateRandomString(5);
    // Create the order
    const newOrder = new Order({
      userID: userID || null, // Optional
      name,email,phoneNumber,additionalNote: additionalNote || null,shippingFee,shippingAddress,orderID,paymentMethod,
      paymentStatus: "checking", 
      orderStatus: "processing",
      cartItems,
    });
    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      orderID,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export const getOrderByOrderID = async (req, res) => {
    const {orderID} = req.params;
    try {
      // Find the order by its orderID
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
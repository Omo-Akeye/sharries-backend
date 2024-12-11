import crypto from "crypto";
import Order from "../models/Order.js";

const generateRandomString = (length = 5) => {
  return crypto.randomBytes(length).toString("hex");
};
export const postOrder = async (req, res) => {
    const { userID,name,email,phoneNumber,additionalNote,shippingMethod,shippingFee,shippingAddress,paymentMethod,
        paymentStatus,transactionID,orderStatus,cartItems}  = req.body;
         // Validate required fields
    if ( !name || !email ||!phoneNumber || !additionalNote ||!shippingMethod ||!shippingFee ||!shippingAddress ||!paymentMethod ||
        !paymentStatus ||!transactionID ||!orderStatus, !cartItems ||!Array.isArray(cartItems) ||cartItems.length === 0
      ) {
        return res.status(400).json({ error: "All fields except userID are required." });
      }
  try {
    // Generate a random orderID
    const orderID = generateRandomString(12);
    // Create the order
    const newOrder = new Order({
      userID: userID || null, // Optional field
      name,email,phoneNumber,additionalNote,shippingMethod,shippingFee,shippingAddress,orderID,paymentMethod,paymentStatus,
      transactionID ,orderStatus,cartItems,
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
    console.log(orderID)
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


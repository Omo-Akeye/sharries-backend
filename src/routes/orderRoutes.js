import express from "express";
import { getOrderByOrderID, postOrder } from "../controllers/orderControllers.js";


const orderRouter= express.Router();

orderRouter.post('/postorder',postOrder)
orderRouter.get('/order/:orderID',getOrderByOrderID)

export default orderRouter;
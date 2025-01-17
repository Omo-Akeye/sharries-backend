import express from "express";
import { deleteOrder, getAllOrders, getOrderByOrderID, getUserOrderHistory, postOrder } from "../controllers/orderControllers.js";


const orderRouter= express.Router();

orderRouter.post('/postorder',postOrder)
orderRouter.get('/order/:orderID',getOrderByOrderID)
orderRouter.get('/getorders',getAllOrders)
orderRouter.delete('/order/:orderID',deleteOrder)
orderRouter.get('/user/orders',getUserOrderHistory)

export default orderRouter;
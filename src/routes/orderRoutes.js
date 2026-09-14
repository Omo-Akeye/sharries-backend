import express from "express";
import { authenticateJWT, authorizeAdmin } from "../middlewares/auth.js";
import { deleteOrder, getAllOrders, getOrderByOrderID, getUserOrderHistory, optionalAuth, postOrder } from "../controllers/orderControllers.js";


const orderRouter= express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement and management
 */

/**
 * @swagger
 * /postorder:
 *   post:
 *     summary: Place a new order (guest or logged-in)
 *     description: >
 *       Prices, stock, and quantities are validated server-side against the
 *       catalog; client-submitted totals are never trusted. If logged in,
 *       the order is also attached to the user's order history.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phoneNumber, shippingFee, shippingAddress, paymentMethod, cartItems]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: number }
 *               additionalNote: { type: string }
 *               shippingFee: { type: number }
 *               shippingAddress: { type: string }
 *               paymentMethod: { type: string }
 *               cartItems:
 *                 type: array
 *                 maxItems: 50
 *                 items: { $ref: '#/components/schemas/CartItem' }
 *     responses:
 *       201: { description: Order created successfully }
 *       400: { description: Invalid input, price/stock mismatch, or out-of-stock items }
 */
orderRouter.post('/postorder',optionalAuth,postOrder)

/**
 * @swagger
 * /order/{orderID}:
 *   get:
 *     summary: Look up an order by its ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     summary: Delete an order (admin only)
 *     tags: [Orders]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: orderID
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Order deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
orderRouter.get('/order/:orderID',getOrderByOrderID)

/**
 * @swagger
 * /getorders:
 *   get:
 *     summary: List every order (admin only)
 *     tags: [Orders]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: All orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
orderRouter.get('/getorders',authenticateJWT,authorizeAdmin,getAllOrders)

orderRouter.delete('/order/:orderID',authenticateJWT,authorizeAdmin,deleteOrder)

/**
 * @swagger
 * /user/orders:
 *   get:
 *     summary: Get the current user's own order history
 *     tags: [Orders]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Order history }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
orderRouter.get('/user/orders',authenticateJWT,getUserOrderHistory)

export default orderRouter;

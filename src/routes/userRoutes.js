
import express from "express";
import {
  register,
  login,
  logout,
  checkAuth,
  userTotalSpent,
  getProfile
} from "../controllers/authControllers.js";
import { authenticateJWT } from "../middlewares/auth.js";
import { validateAuthInput } from "../middlewares/validateAuthInput.js";
import { authLimiter } from "../middlewares/rateLimiters.js";

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration, login, session, and profile
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phoneNumber, email, password]
 *             properties:
 *               name: { type: string }
 *               phoneNumber: { type: number }
 *               email: { type: string, format: email }
 *               password:
 *                 type: string
 *                 description: 8-128 characters, at least one letter and one number
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Invalid input or weak password }
 *       409: { description: A user with this email already exists }
 *       429: { description: Too many attempts }
 */
userRouter.post("/register", authLimiter, validateAuthInput, register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in and receive an auth-token cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful; sets the auth-token httpOnly cookie
 *       401: { description: Invalid credentials }
 *       429: { description: Too many attempts }
 */
userRouter.post("/login", authLimiter, validateAuthInput, login);

/**
 * @swagger
 * /user/total-spent:
 *   post:
 *     summary: Recalculate and return the current user's total amount spent
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Total spent and order summary }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.post("/user/total-spent", authenticateJWT, userTotalSpent);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out and invalidate the current token server-side
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200: { description: Logged out successfully }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.post("/logout", authenticateJWT, logout);

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check whether the current session is authenticated
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.get("/check-auth", authenticateJWT, checkAuth);

/**
 * @swagger
 * /user-profile:
 *   get:
 *     summary: Get the current user's profile
 *     tags: [Auth]
 *     security: [{ cookieAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
userRouter.get("/user-profile", authenticateJWT, getProfile);

export default userRouter;

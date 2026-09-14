import express from "express"
import { authenticateJWT } from '../middlewares/auth.js';
import { createReview, getReviews, updateReview, deleteReview } from '../controllers/reviewsController.js';


const reviewRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews
 */

/**
 * @swagger
 * /products/{productId}/reviews:
 *   post:
 *     summary: Add a review for a product
 *     description: The author is taken from the authenticated session, never the request body.
 *     tags: [Reviews]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment: { type: string }
 *     responses:
 *       201: { description: Review added }
 *       400: { description: Comment is required }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   get:
 *     summary: Get all reviews for a product
 *     description: Only the reviewer's name is exposed, never other profile fields.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reviews for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Review' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
reviewRoute.post('/products/:productId/reviews', authenticateJWT, createReview);


reviewRoute.get('/products/:productId/reviews', getReviews);


/**
 * @swagger
 * /products/{productId}/reviews/{reviewId}:
 *   put:
 *     summary: Update a review (author or admin only)
 *     tags: [Reviews]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment: { type: string }
 *     responses:
 *       200: { description: Review updated }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     summary: Delete a review (author or admin only)
 *     tags: [Reviews]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Review deleted }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
reviewRoute.put('/products/:productId/reviews/:reviewId', authenticateJWT, updateReview);

reviewRoute.delete('/products/:productId/reviews/:reviewId', authenticateJWT, deleteReview);


export default reviewRoute

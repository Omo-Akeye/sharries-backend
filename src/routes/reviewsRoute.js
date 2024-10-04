import express from "express"
import { createReview, getReviews, updateReview, deleteReview } from '../controllers/reviewsController.js';


const reviewRoute = express.Router();

reviewRoute.post('/products/:productId/reviews', createReview);


reviewRoute.get('/products/:productId/reviews', getReviews);


reviewRoute.put('/products/:productId/reviews/:reviewId', updateReview);

reviewRoute.delete('/products/:productId/reviews/:reviewId', deleteReview);


export default reviewRoute
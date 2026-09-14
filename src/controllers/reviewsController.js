import Product from "../models/Product.js";
import { escapeHtml } from "../utils/sanitize.js";

export const createReview = async (req, res) => {

    const { productId } = req.params;
    const { comment } = req.body;

    if (typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const review = {
        user: req.user._id,
        comment: escapeHtml(comment.trim()),
      };
  
      product.reviews.push(review);
      await product.save();
  
      res.status(201).json({ message: 'Review added', product });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
    }
  };


  export const getReviews = async (req, res) => {
    const { productId } = req.params;
  
    try {
      const product = await Product.findById(productId).populate('reviews.user', 'name');
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.status(200).json(product.reviews);
    } catch (error) {
      console.error("Error in getReviews:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  export const updateReview = async (req, res) => {
    const { productId, reviewId } = req.params;
    const { comment} = req.body;
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if ((!review.user || review.user.toString() !== req.user._id.toString()) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only edit your own review' });
      }

      if (comment !== undefined) {
        if (typeof comment !== 'string' || !comment.trim()) {
          return res.status(400).json({ message: 'Comment must not be empty' });
        }
        review.comment = escapeHtml(comment.trim());
      }

      await product.save();

      res.status(200).json({ message: 'Review updated', product });
    } catch (error) {
      console.error("Error in updateReview:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };

  
  export const deleteReview = async (req, res) => {
    const { productId, reviewId } = req.params;
  
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if ((!review.user || review.user.toString() !== req.user._id.toString()) && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only delete your own review' });
      }

      review.remove();
      await product.save();
  
      res.status(200).json({ message: 'Review deleted', product });
    } catch (error) {
      console.error("Error in deleteReview:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
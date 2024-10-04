import Product from "../models/Product.js";

export const createReview = async (req, res) => {
    const { productId } = req.params;
    const { user, comment } = req.body;
    
    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const review = {
        user, 
        comment,
      };
  
      product.reviews.push(review);
      await product.save();
  
      res.status(201).json({ message: 'Review added', product });
    } catch (error) {
      console.error("Error in createReview:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  export const getReviews = async (req, res) => {
    const { productId } = req.params;
  
    try {
      const product = await Product.findById(productId).populate('reviews.user');
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
  
     
      review.comment = comment || review.comment;
     
  
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
  
      review.remove(); 
      await product.save();
  
      res.status(200).json({ message: 'Review deleted', product });
    } catch (error) {
      console.error("Error in deleteReview:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
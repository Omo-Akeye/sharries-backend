import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categories: { type: [String], required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true }, 
  reviews: [reviewSchema],
});

const Product = mongoose.model('Product', productSchema);
export default Product;

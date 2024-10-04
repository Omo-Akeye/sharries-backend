

import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  console.log("Received request to create product with data:", req.body);
  const { name, categories, price } = req.body;
  try {
    const product = new Product({
      name,
      categories,
      price,
      images: req.body.images,
    });
    console.log("Saving product:", product); 
    await product.save();
    console.log("Product saved successfully");  
    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error); 
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

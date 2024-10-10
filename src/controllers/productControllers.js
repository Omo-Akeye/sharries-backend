

import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  // console.log(req.body);
  const {name,categories,price,description,howToUse,images,isOutOfStock} = req.body;
  const parsedPrice = parseFloat(price); 
  const parsedIsOutOfStock = isOutOfStock === 'false'; 
  try {
    const product = new Product({
      name,
      categories,
      price:parsedPrice,
      description,
      howToUse,
      images: req.body.images,
      isOutOfStock:parsedIsOutOfStock
    });
    
    await product.save();
      
    res.status(201).json(product);
  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: 'Server Error', error: err.message });
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

export const deleteProduct = async(req,res)=> {
   const {productId} = req.params
  try {
    const product = await Product.findByIdAndDelete(productId)
    if (!productId) {
      return res.status(400).json({message:"Product not found"})
    }
    res.status(200).json({message:"product deleted"})
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({ message: 'Server error' });
  }
}


export const updateProduct = async (req,res) => {
  const {productId} = req.params;
  try {
    const product = await Product.findByIdAndUpdate(productId)
    if(!productId) {
      return res.status(404).json({message:"Product not found"})
    }
    res.status(200).json({message:"Product updated"})
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({ message: 'Server error' });
  }
}



export const getProductById = async (req,res) =>{
  const {productId} = req.params;
  try {
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({message:"Product not found"})
    }
    return res.status(200).json(product)
  } catch (error) {
    console.error("Error in searchProducts:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const searchProduct = async (req,res) => {
  const {query} = req.query
  try {
    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
    })

    res.status(200).json(products);
  } catch (error) {
    console.error(err); 
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
 
}


export const getFilteredProducts = async (req, res) => {
  const { filter, page = 1, limit = 10 } = req.query;

  const query = {};

  try {
    let sortOptions = {};
    if (filter) {
      if (filter === 'price-low-to-high') {
        sortOptions.price = 1; 
      } else if (filter === 'price-high-to-low') {
        sortOptions.price = -1; 
      } else if (filter === 'latest') {
        sortOptions.createdAt = -1; 
      } else if (filter === 'oldest') {
        sortOptions.createdAt = 1; 
      }
    }

    const pageNumber = parseInt(page, 10) || 1; 
    const pageSize = parseInt(limit, 10) || 10; 
    const skip = (pageNumber - 1) * pageSize;

    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    
    const totalCount = await Product.countDocuments(query);

    res.status(200).json({
      products,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      totalProducts: totalCount,
    });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

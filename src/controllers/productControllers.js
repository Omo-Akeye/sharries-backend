

import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  console.log(req.body);
  const { name, categories, price,description,howToUse,images,isOutOfStock} = req.body;
  try {
    const product = new Product({
      name,
      categories,
      price,
      description,
      howToUse,
      images: req.body.images,
      isOutOfStock,
  
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



// Get all products with filters, sorting, and pagination
export const getFilteredProducts = async (req, res) => {
  const { categories, sortBy, order = 'asc', minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  const query = {};
  if (categories) {
    query.categories = { $in: categories.split(',') }; // Multiple categories can be passed as a comma-separated string
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice); // $gte = Greater than or equal to
    if (maxPrice) query.price.$lte = Number(maxPrice); // $lte = Less than or equal to
  }

  try {
    // Sorting logic
    let sortOptions = {};
    if (sortBy) {
      if (sortBy === 'price') {
        sortOptions.price = order === 'asc' ? 1 : -1; // Ascending or descending price
      } else if (sortBy === 'date') {
        sortOptions.date = order === 'asc' ? 1 : -1; // Ascending or descending date added
      }
    }

    // Pagination logic
    const pageNumber = parseInt(page, 10) || 1; // Default page is 1
    const pageSize = parseInt(limit, 10) || 10; // Default limit is 10
    const skip = (pageNumber - 1) * pageSize;

    // Get the products with applied filters, sorting, and pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // Get the total count of products that match the query (for pagination)
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
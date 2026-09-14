import Product from "../models/Product.js";
import { escapeHtml } from "../utils/sanitize.js";



export const createProduct = async (req, res) => {
  const {name,categories,price,description,howToUse,images,isOutOfStock} = req.body;
  const parsedPrice = parseFloat(price);
  const parsedIsOutOfStock = isOutOfStock === 'false';
  try {
    const product = new Product({
      name: escapeHtml(name),
      categories,
      price:parsedPrice,
      description: escapeHtml(description),
      howToUse: escapeHtml(howToUse),
      images: req.body.images,
      isOutOfStock:parsedIsOutOfStock
    });
    await product.save();

    console.info(`[AUDIT] ${new Date().toISOString()} user=${req.user._id} created product=${product._id}`);
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
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
    if (!product) {
      return res.status(404).json({message:"Product not found"})
    }
    console.info(`[AUDIT] ${new Date().toISOString()} user=${req.user._id} deleted product=${productId}`);
    res.status(200).json({message:"product deleted"})
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({ message: 'Server error' });
  }
}


export const updateProduct = async (req,res) => {
  const {productId} = req.params;
  const {name,categories,price,description,howToUse,isOutOfStock} = req.body;
  try {
    const updates = {};
    if (name !== undefined) updates.name = escapeHtml(name);
    if (categories !== undefined) updates.categories = categories;
    if (price !== undefined) updates.price = parseFloat(price);
    if (description !== undefined) updates.description = escapeHtml(description);
    if (howToUse !== undefined) updates.howToUse = escapeHtml(howToUse);
    if (isOutOfStock !== undefined) updates.isOutOfStock = isOutOfStock === true || isOutOfStock === 'true';

    const product = await Product.findByIdAndUpdate(productId, updates, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({message:"Product not found"})
    }
    console.info(`[AUDIT] ${new Date().toISOString()} user=${req.user._id} updated product=${productId}`);
    res.status(200).json({message:"Product updated", product})
  } catch (error) {
    console.error("Error in updateProduct:", error);
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


export const searchProduct = async (req, res) => {
  try {
    const { productname } = req.params;
    
    if (!productname || productname.trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please enter at least 3 characters to search'
      });
    }

    const escapedName = productname.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const products = await Product.find({
      name: {
        $regex: new RegExp(escapedName, 'i')
      }
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No products found matching the search criteria'
      });
    }

    return res.status(200).json({
      data: products
    });
  } catch (error) {
    console.error('Search product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching for products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


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

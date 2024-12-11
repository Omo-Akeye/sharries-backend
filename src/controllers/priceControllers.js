import Product from "../models/Product.js";
export const priceValidation = async (req,res) => {
    const {cart} = req.body;
    if (!cart || !Array.isArray(cart)) {
      console.error("Invalid cart data:", req.body);
      return res.status(400).json({ message: "Invalid cart data." });
    }
      const productIds = cart.map((item) => item._id);
    try {
        const products = await Product.find({ _id: { $in: productIds } });
        const priceLookup = Object.fromEntries(
            products.map((product) => [product._id.toString(), product.price])
          );
          const priceValidationResult = cart.map((item) => {
            const databasePrice = priceLookup[item._id];
             return {
              id: item._id,
              frontendPrice: item.price,
              databasePrice: databasePrice,
              isValid: databasePrice === item.price,
            };
          });
    const allPricesValid = priceValidationResult.every((result) => result.isValid);
    if (!allPricesValid) {
      return res.status(400).json({
        message: "Price dont match",
        priceValidationResult,
      });
    }
      res.json({
        message: "Prices are valid."
      });  
} catch (error) {
        res.status(500).json({ message: 'Failed to fetch prices.' });
      }
    }


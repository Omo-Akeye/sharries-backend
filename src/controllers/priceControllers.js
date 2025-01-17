import Product from "../models/Product.js";

export default async function validateCartPrices(cartItems)  {
  try {
  
    const productIds = cartItems.map(item => item._id);
    const products = await Product.find({ _id: { $in: productIds } });

   
    if (products.length !== productIds.length) {
      return {
        isValid: false,
        error: "Some products were not found",
        invalidProducts: productIds.filter(id => 
          !products.some(p => p._id.toString() === id)
        )
      };
    }


    const priceMap = Object.fromEntries(
      products.map(product => [product._id.toString(), product.price])
    );

    
    const discrepancies = [];
    let orderSubtotal = 0;

    cartItems.forEach(item => {
      const databasePrice = priceMap[item._id];
      const calculatedSubtotal = databasePrice * item.quantity;
      
      const priceDiscrepancy = item.price !== databasePrice;
      const subtotalDiscrepancy = item.subTotal !== calculatedSubtotal;

      if (priceDiscrepancy || subtotalDiscrepancy) {
        discrepancies.push({
          productId: item._id,
          productName: item.name,
          expectedPrice: databasePrice,
          submittedPrice: item.price,
          expectedSubtotal: calculatedSubtotal,
          submittedSubtotal: item.subTotal,
          quantity: item.quantity,
          issues: {
            price: priceDiscrepancy ? "Price mismatch" : null,
            subtotal: subtotalDiscrepancy ? "Subtotal calculation error" : null
          }
        });
      }

      orderSubtotal += calculatedSubtotal;
    });

    return {
      isValid: discrepancies.length === 0,
      orderSubtotal,
      products,
      priceMap,
      discrepancies,
      error: discrepancies.length > 0 ? "Price and/or subtotal discrepancies found" : null
    };
  } catch (error) {
    console.error("Price validation error:", error);
    throw new Error("Failed to validate prices");
  }
};
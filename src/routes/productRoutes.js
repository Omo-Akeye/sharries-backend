import express from 'express';
import uploadImage from '../middlewares/upload.js';
import { createProduct, deleteProduct, getFilteredProducts, getProductById, getProducts, searchProduct, updateProduct } from '../controllers/productControllers.js';
import { priceValidation } from '../controllers/priceControllers.js';



const productRouter = express.Router();

productRouter.post('/addproduct',uploadImage, createProduct);  
productRouter.get('/getproducts', getProducts);
productRouter.delete('/deleteproduct/:productId',deleteProduct)
productRouter.put('/updateproduct/:productId',updateProduct)
productRouter.get('/product/get-filtered-products',getFilteredProducts)
productRouter.get('/product/:productId',getProductById)
productRouter.get('/product/search/:productname',searchProduct)


productRouter.post('/validateprice', priceValidation);


export default productRouter;

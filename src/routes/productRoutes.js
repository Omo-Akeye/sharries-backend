import express from 'express';
import uploadImage from '../middlewares/upload.js';
import { createProduct, deleteProduct, getFilteredProducts, getProducts, updateProduct } from '../controllers/productControllers.js';


const productRouter = express.Router();

productRouter.post('/addproduct',uploadImage, createProduct);  
productRouter.get('/getproducts', getProducts);
productRouter.delete('/deleteproduct/:productId',deleteProduct)
productRouter.put('/updateproduct/:productId',updateProduct)
productRouter.get('/product/get-filtered-products',getFilteredProducts)


export default productRouter;

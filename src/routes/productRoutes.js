import express from 'express';
import uploadImage from '../middlewares/upload.js';
import { createProduct, getProducts } from '../controllers/productControllers.js';


const productRouter = express.Router();

productRouter.post('/addproduct',uploadImage, createProduct);  
productRouter.get('/getproducts', getProducts);  

export default productRouter;
